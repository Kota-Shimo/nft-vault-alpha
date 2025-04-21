import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import {
  GqlArgumentsHost,
  GqlExceptionFilter,
} from '@nestjs/graphql';
import { logger } from './logger';   // ← 自前 JSON ロガー

@Catch(HttpException)
export class GqlHttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const info    = gqlHost.getInfo();
    const req     = gqlHost.getContext().req;
    const user    = req?.user ?? {};

    const resObj = exception.getResponse() as any;
    resObj.field = info.fieldName;
    resObj.uid   = user.sub ?? 'anon';

    logger.warn({ msg: 'GQL_ERR', ...resObj });
    return exception;
  }
}
