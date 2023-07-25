import { GetConfigurationByIdController } from './get-configuration-by-id/get-configuration-by-id.controller';
import { GetConfigurationByIdHandler } from './get-configuration-by-id/get-configuration-by-id.handler';
import { GetConfigurationRevisionJsonExportController } from './get-configuration-revision-json-export/get-configuration-revision-json-export.controller';
import { GetConfigurationRevisionJsonExportHandler } from './get-configuration-revision-json-export/get-configuration-revision-json-export.handler';
import { GetConfigurationRevisionsController } from './get-configuration-revisions/get-configuration-revisions.controller';
import { GetConfigurationRevisionsHandler } from './get-configuration-revisions/get-configuration-revisions.handler';
import { GetConfigurationsController } from './get-configurations/get-configurations.controller';
import { GetConfigurationsHandler } from './get-configurations/get-configurations.handler';
import { GetFeatureFlagsForConfigurationRevisionController } from './get-feature-flags-for-configuration-revision/get-feature-flags-for-configuration-revision.controller';
import { GetFeatureFlagsForConfigurationRevisionHandler } from './get-feature-flags-for-configuration-revision/get-feature-flags-for-configuration-revision.handler';

export const queryHandlers = [
  GetConfigurationsHandler,
  GetConfigurationByIdHandler,
  GetConfigurationRevisionsHandler,
  GetFeatureFlagsForConfigurationRevisionHandler,
  GetConfigurationRevisionJsonExportHandler,
];

export const queryControllers = [
  GetConfigurationsController,
  GetConfigurationByIdController,
  GetConfigurationRevisionsController,
  GetFeatureFlagsForConfigurationRevisionController,
  GetConfigurationRevisionJsonExportController,
];