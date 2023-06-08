import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import Heading from "../../../../../../components/heading/heading";
import { LoadingPage } from "../../../../../../components/loading-page/loading-page";
import { useGetAvailableSecurityAttributesQuery } from "../../../../../../store/api/slices/security/security.api";
import { AddSecurityPolicyBreadcrumbs } from "./components/add-security-policy-breadcrumbs";
import { AddSecurityPolicyForm } from "./components/add-security-policy-form";

export function AddSecurityPolicyPage() {
  const { isLoading, isError, isSuccess, data } =
    useGetAvailableSecurityAttributesQuery();

  return (
    <>
      <LoadingPage isLoading={isLoading} isError={isError} />
      {isSuccess && data && (
        <>
          <AddSecurityPolicyBreadcrumbs />
          <Heading level={1} className={classNames("my-4")}>
            <FormattedMessage id="security.add-security-policy.title" />
          </Heading>
          <p className={classNames("max-w-5xl", "mb-4")}>
            <FormattedMessage id="security.add-security-policy.description" />
          </p>
          <AddSecurityPolicyForm availableAttributes={data} />
        </>
      )}
    </>
  );
}
