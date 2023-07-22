import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PagedResponse } from '../../../../common/types/paged-response.dto';
import { createPagedAggregationPipeline } from '../../../../common/utils/paged-aggregation/paged-aggregation';
import {
  ConfigurationRevisionFeatureFlagAssociation,
  ConfigurationRevisionFeatureFlagAssociationDocument,
} from '../../schemas/configuration-revision-feature-flag-association/configuration-revision-feature-flag-association';
import {
  ConfigurationRevision,
  ConfigurationRevisionDocument,
} from '../../schemas/configuration-revision/configuration-revision.schema';
import {
  Configuration,
  ConfigurationDocument,
} from '../../schemas/configuration/configuration.schema';
import {
  VersionTag,
  VersionTagDocument,
} from '../../schemas/version-tag/version-tag.schema';

@Injectable()
export class ConfigurationRepository {
  constructor(
    @InjectModel(Configuration.name)
    private readonly configurationModel: Model<ConfigurationDocument>,
    @InjectModel(ConfigurationRevision.name)
    private readonly revisionModel: Model<ConfigurationRevisionDocument>,
    @InjectModel(ConfigurationRevisionFeatureFlagAssociation.name)
    private readonly featureFlagAssociationModel: Model<ConfigurationRevisionFeatureFlagAssociationDocument>,
    @InjectModel(VersionTag.name)
    private readonly versionTagModel: Model<VersionTagDocument>,
  ) {}

  async createConfiguration(
    name: string,
    autoBuild: boolean,
  ): Promise<ConfigurationDocument> {
    const configuration: Configuration = {
      name,
      autoBuild,
    };
    const document = await this.configurationModel.create(configuration);
    return document;
  }

  async createConfigurationRevision(
    configurationId: string,
    revision: number,
    featureFlagIds: string[],
    minimumVersionTagId: string,
  ): Promise<ConfigurationRevisionDocument> {
    const versionTagDocument = await this.versionTagModel
      .findById(minimumVersionTagId)
      .exec();
    if (!versionTagDocument) {
      throw new NotFoundException();
    }
    const configurationRevision: ConfigurationRevision = {
      configurationId,
      revision,
      minimumVersionTagId,
    };
    const revisionDocument = await this.revisionModel.create(
      configurationRevision,
    );
    await Promise.all(
      featureFlagIds.map((featureFlagId) =>
        this.associateFeatureFlagWithConfigurationRevision(
          revisionDocument._id,
          featureFlagId,
        ),
      ),
    );
    return revisionDocument;
  }

  async associateFeatureFlagWithConfigurationRevision(
    configurationRevisionId: string,
    featureFlagId: string,
  ): Promise<ConfigurationRevisionFeatureFlagAssociationDocument> {
    const association: ConfigurationRevisionFeatureFlagAssociation = {
      configurationRevisionId,
      featureFlagId,
    };
    return this.featureFlagAssociationModel.create(association);
  }

  async getConfigurationById(
    configurationId: string,
  ): Promise<(ConfigurationDocument & { revisions: number }) | undefined> {
    return (
      await this.configurationModel
        .aggregate()
        .match({ _id: configurationId })
        .limit(1)
        .lookup({
          from: this.revisionModel.collection.name,
          localField: '_id',
          foreignField: 'configurationId',
          as: 'revisions',
        })
        .addFields({
          revisions: { $size: '$revisions' },
        })
        .exec()
    ).at(0);
  }

  async getConfigurationByIdOrThrow(
    configurationId: string,
  ): Promise<ConfigurationDocument & { revisions: number }> {
    const configurationDocument = await this.getConfigurationById(
      configurationId,
    );
    if (!configurationDocument) {
      throw new NotFoundException();
    }
    return configurationDocument;
  }

  async getConfigurationRevisions(
    configurationId: string,
    skip: number,
    limit: number,
  ): Promise<PagedResponse<ConfigurationRevisionDocument & { name: string }>> {
    const aggregationResultPromise = this.revisionModel.aggregate(
      createPagedAggregationPipeline({
        skip,
        limit,
        preProcessingStages: [
          {
            $match: {
              configurationId,
            },
          },
          {
            $sort: {
              revision: -1,
            },
          },
        ],
      }),
    );
    const configurationDocumentPromise =
      this.getConfigurationByIdOrThrow(configurationId);
    const [aggregationResult, configurationDocument] = await Promise.all([
      aggregationResultPromise,
      configurationDocumentPromise,
    ]);

    return {
      skip,
      limit,
      total: aggregationResult.at(0).total,
      items: aggregationResult
        .at(0)
        .items.map(
          (configurationRevisionDocument: ConfigurationRevisionDocument) => ({
            ...configurationRevisionDocument,
            name: `${configurationDocument.name} (rev ${configurationRevisionDocument.revision})`,
          }),
        ),
    };
  }

  async getConfigurations(
    skip: number,
    limit: number,
  ): Promise<PagedResponse<ConfigurationDocument & { revisions: number }>> {
    const result = await this.configurationModel.aggregate(
      createPagedAggregationPipeline({
        skip,
        limit,
        preProcessingStages: [{ $sort: { name: 1 } }],
        itemProcessingStages: [
          {
            $lookup: {
              from: this.revisionModel.collection.name,
              localField: '_id',
              foreignField: 'configurationId',
              as: 'revisions',
            },
          },
          {
            $addFields: {
              revisions: { $size: '$revisions' },
            },
          },
        ],
      }),
    );
    return {
      skip,
      limit,
      total: result.at(0).total,
      items: result.at(0).items,
    };
  }
}
