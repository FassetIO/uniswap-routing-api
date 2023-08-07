import * as ssm from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'

const REGION = 'us-east-2'

const getParameter = (scope: Construct, name: string): string => {
  return ssm.StringParameter.valueForStringParameter(scope, name)
}

function getEnvironmentVariables(scope: Construct, env: string) {
  return {
    // TODO: use secrets manager for provider keys
    jsonRpcProviders: {
      WEB3_RPC_1: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_1`),
      WEB3_RPC_3: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_3`),
      WEB3_RPC_4: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_4`),
      WEB3_RPC_5: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_5`),
      WEB3_RPC_42: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_42`),
      WEB3_RPC_10: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_10`),
      WEB3_RPC_69: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_69`),
      WEB3_RPC_42161: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_42161`),
      WEB3_RPC_421611: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_421611`),
      WEB3_RPC_137: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_137`),
      WEB3_RPC_80001: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_80001`),
      WEB3_RPC_56: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_56`),
    },
    THROTTLE_PER_FIVE_MINS: '',
    TENDERLY_USER: '',
    TENDERLY_PROJECT: '',
    TENDERLY_ACCESS_KEY: '',
  }
}

export type BaseCDKContext = {
  awsRegion: string
  awsAccountId: string
  deployRoleArn: string
}

export type CDKContext = {
  awsRegion: string
  envName: string
  secretArn: string
  vpcId: string
  defaultSGId: string
  vpcPrivateSubnets: string[]
  environment: any
}

export const baseEnvironmentConfig = (envName: string): BaseCDKContext => {
  const environmentMapper: {
    [envName: string]: BaseCDKContext
  } = {
    dev: {
      awsRegion: REGION,
      awsAccountId: '683031685817',
      deployRoleArn: 'arn:aws:iam::683031685817:role/dev-CodebuildGlobal-role',
    },
    prod: {
      // TODO: currently we only have dev deployment.
      awsRegion: REGION,
      awsAccountId: '683031685817',
      deployRoleArn: 'arn:aws:iam::683031685817:role/dev-CodebuildGlobal-role',
    },
  }
  return environmentMapper[envName]
}

export const environmentConfig = (scope: Construct, envName: string): CDKContext => {
  const environmentMapper: {
    [envName: string]: CDKContext
  } = {
    dev: {
      envName: envName,
      awsRegion: REGION,
      secretArn: 'arn:aws:secretsmanager:ap-southeast-3:683031685817:secret:dev-secret-wallet-api-I0DajC',
      vpcId: 'vpc-0bc90b7c6b50eeefe',
      defaultSGId: 'sg-0703e567213625a09',
      vpcPrivateSubnets: ['subnet-098bba581a811be27', 'subnet-02c391bd516da0e17'],
      environment: {
        ...getEnvironmentVariables(scope, envName),
      },
    },
    prod: {
      envName: envName,
      awsRegion: REGION,
      secretArn: 'arn:aws:secretsmanager:ap-southeast-3:683031685817:secret:dev-secret-wallet-api-I0DajC',
      vpcId: 'vpc-0bc90b7c6b50eeefe',
      defaultSGId: 'sg-0703e567213625a09',
      vpcPrivateSubnets: ['subnet-098bba581a811be27', 'subnet-02c391bd516da0e17'],
      environment: {
        ...getEnvironmentVariables(scope, envName),
      },
    },
  }
  return environmentMapper[envName]
}
