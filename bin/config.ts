import * as ssm from 'aws-cdk-lib/aws-ssm'
import * as sm from 'aws-cdk-lib/aws-secretsmanager'
import { Construct } from 'constructs'

const REGION = 'us-east-2'

const getParameter = (scope: Construct, name: string): string => {
  return ssm.StringParameter.valueForStringParameter(scope, name)
}
const getSecret = (scope: Construct, secretArn: string) => {
  return sm.Secret.fromSecretCompleteArn(scope, `RoutingApiSecret`, secretArn)
}

const getSecretParameterValue = (secret: sm.ISecret, keyName: string) => {
  return secret.secretValueFromJson(keyName)
}

function getEnvironmentVariables(scope: Construct, env: string, secret: sm.ISecret) {
  return {
    // TODO: use secrets manager for provider keys
    jsonRpcProviders: {
      WEB3_RPC_1: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_1`),
      WEB3_RPC_5: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_5`),
      WEB3_RPC_11155111: getParameter(scope, `/${env}/general/wallet-api/JSON_RPC_PROVIDER_11155111`),
    },
    THROTTLE_PER_FIVE_MINS: '',
    TENDERLY_USER: '',
    TENDERLY_PROJECT: '',
    TENDERLY_ACCESS_KEY: '',
    API_KEY: getSecretParameterValue(secret, 'UNISWAP_ROUTING_API_KEY'),
    CACHING_LAMBDA_SCHEDULE_MINS:
      process.env.CACHING_LAMBDA_SCHEDULE_MINS ??
      getParameter(scope, `/${env}/general/wallet-api/CACHING_LAMBDA_SCHEDULE_MINS`),
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
  apiGatewaySGId: string
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
      awsRegion: REGION,
      awsAccountId: '024147136615',
      deployRoleArn: 'arn:aws:iam::024147136615:role/dev-CodebuildGlobal-role',
    },
  }
  return environmentMapper[envName]
}

export const environmentConfig = (scope: Construct, envName: string): CDKContext => {
  const devSecretArn = 'arn:aws:secretsmanager:us-east-2:683031685817:secret:dev-secrets-routing-api-VrvlNT'
  const prodSecretArn = 'arn:aws:secretsmanager:us-east-2:024147136615:secret:prod-secrets-routing-api-RK3NWl'
  const secret = getSecret(scope, envName === 'dev' ? devSecretArn : prodSecretArn)

  const environmentMapper: {
    [envName: string]: CDKContext
  } = {
    dev: {
      envName: envName,
      awsRegion: REGION,
      secretArn: devSecretArn,
      vpcId: 'vpc-0bc90b7c6b50eeefe',
      defaultSGId: 'sg-0703e567213625a09',
      apiGatewaySGId: 'sg-08a0f283054f417fe',
      vpcPrivateSubnets: ['subnet-098bba581a811be27', 'subnet-02c391bd516da0e17'],
      environment: {
        ...getEnvironmentVariables(scope, envName, secret),
      },
    },
    prod: {
      envName: envName,
      awsRegion: REGION,
      secretArn: prodSecretArn,
      vpcId: 'vpc-06e4f5029845be060',
      defaultSGId: 'sg-06dec9ed472921b74',
      apiGatewaySGId: 'sg-0bc53924fe00cce07',
      vpcPrivateSubnets: ['subnet-0d732ee2f48d5c0c7', 'subnet-04b36171ebf5b3356', 'subnet-0e2100dbc552b46b0'],
      environment: {
        ...getEnvironmentVariables(scope, envName, secret),
      },
    },
  }
  return environmentMapper[envName]
}
