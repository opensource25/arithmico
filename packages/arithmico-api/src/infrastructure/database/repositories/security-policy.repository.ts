import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SecurityPolicy,
  SecurityPolicyDocument,
} from '../schemas/security-policy/security-policy.schema';

@Injectable()
export class SecurityPolicyRepository {
  constructor(
    @InjectModel(SecurityPolicy.name)
    private securityPolicyModel: Model<SecurityPolicy>,
  ) {}

  async findById(policyId: string): Promise<SecurityPolicyDocument | null> {
    return this.securityPolicyModel.findById(policyId);
  }

  async findByIdOrThrow(policyId: string): Promise<SecurityPolicy> {
    const securityPolicyDocument = this.findById(policyId);
    if (!securityPolicyDocument) {
      throw new NotFoundException();
    }
    return securityPolicyDocument;
  }

  async findManyByIds(policyIds: string[]): Promise<SecurityPolicy[]> {
    return this.securityPolicyModel.find({
      _id: {
        $in: policyIds,
      },
    });
  }

  async addAttributesToSecurityPolicy(
    policyId: string,
    attributes: string[],
  ): Promise<SecurityPolicy | null> {
    return <Promise<SecurityPolicy | null>>(
      this.securityPolicyModel.findOneAndUpdate(
        { _id: policyId },
        {
          $addToSet: {
            attributes: {
              $each: attributes,
            },
          },
        },
        { new: true },
      )
    );
  }

  async addAttributesToSecurityPolicyOrThrow(
    policyId: string,
    attributes: string[],
  ) {
    const securityPolicyDocument = this.addAttributesToSecurityPolicy(
      policyId,
      attributes,
    );
    if (!securityPolicyDocument) {
      throw new NotFoundException();
    }
    return securityPolicyDocument;
  }

  async removeAttributesFromSecurityPolicy(
    policyId: string,
    attributes: string[],
  ): Promise<SecurityPolicy | null> {
    return this.securityPolicyModel.findOneAndUpdate(
      {
        _id: policyId,
      },
      {
        $pull: {
          attributes: {
            $each: attributes,
          },
        },
      },
      {
        new: true,
      },
    );
  }

  async removeAttributesFromSecurityPolicyOrThrow(
    policyId: string,
    attributes: string[],
  ) {
    const securityPolicyDocument = this.removeAttributesFromSecurityPolicy(
      policyId,
      attributes,
    );
    if (!securityPolicyDocument) {
      throw new NotFoundException();
    }
    return securityPolicyDocument;
  }
}
