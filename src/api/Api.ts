/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface HandlerCredentials {
  email: string;
  password: string;
}

export interface HandlerLikeRequest {
  like: 0 | 1;
}

export interface HandlerPublishDraftRequest {
  description: string;
  reliability?: number;
  time_in_gb: number;
}

export interface SerializerDraftResponse {
  draft?: SerializerMigrationMethod;
}

export interface SerializerFeedMethod {
  created_by_current_user?: boolean;
  description?: string;
  feed_position?: number;
  feed_size?: number;
  id?: number;
  image_url?: string;
  is_liked?: boolean;
  likes_count?: number;
  reliability?: number;
  time_in_gb?: number;
  title?: string;
  video_url?: string;
}

export interface SerializerFeedResponse {
  method?: SerializerFeedMethod;
}

export interface SerializerGridResponse {
  limit?: number;
  max_time?: number;
  methods?: SerializerMigrationMethod[];
  min_time?: number;
  page?: number;
  total?: number;
}

export interface SerializerLikeResponse {
  method?: SerializerMigrationMethodLike;
}

export interface SerializerMethodResponse {
  method?: SerializerMigrationMethod;
}

export interface SerializerMigrationMethod {
  created_by_current_user?: boolean;
  description?: string;
  id?: number;
  image_url?: string;
  likes_count?: number;
  reliability?: number;
  time_in_gb?: number;
  title?: string;
  video_url?: string;
}

export interface SerializerMigrationMethodLike {
  id?: number;
  is_liked?: boolean;
  likes_count?: number;
}

export interface SerializerTokenResponse {
  access_token?: string;
  /** seconds */
  expires_in?: number;
  token_type?: "Bearer";
}

export interface SerializerUser {
  email?: string;
  id?: number;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "/",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Data Migration API
 * @version 1.0
 * @baseUrl /
 * @contact
 *
 * API методов миграции данных. Для защищенных операций нужен JWT в заголовке Authorization: Bearer <token>. Выход добавляет access-токен в блэклист до истечения срока. Ошибки возвращаются без тела ответа.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Если диапазон времени не задан или некорректен, фильтр не применяется. Bearer-токен необязателен.
     *
     * @tags methods
     * @name MethodsList
     * @summary Список опубликованных методов
     * @request GET:/api/methods
     * @secure
     */
    methodsList: (
      query?: {
        /** Минимальное время на 1 Гб */
        min_time?: number;
        /** Максимальное время на 1 Гб */
        max_time?: number;
        /**
         * Номер страницы
         * @default 1
         */
        page?: number;
        /**
         * Количество элементов на странице
         * @default 10
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerGridResponse, void>({
        path: `/api/methods`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags methods
     * @name MethodsCreate
     * @summary Создать черновик
     * @request POST:/api/methods
     * @secure
     */
    methodsCreate: (
      data: {
        /** Название метода */
        title: string;
        /**
         * Изображение
         * @format binary
         */
        image: File;
        /**
         * Видео
         * @format binary
         */
        video: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerDraftResponse, void>({
        path: `/api/methods`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags methods
     * @name MethodsDelete
     * @summary Удалить свой метод
     * @request DELETE:/api/methods/{id}
     * @secure
     */
    methodsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/methods/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags methods
     * @name MethodsLikeCreate
     * @summary Поставить или снять лайк
     * @request POST:/api/methods/{id}/like
     * @secure
     */
    methodsLikeCreate: (
      id: number,
      request: HandlerLikeRequest,
      params: RequestParams = {},
    ) =>
      this.request<SerializerLikeResponse, void>({
        path: `/api/methods/${id}/like`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags methods
     * @name MethodsDraftList
     * @summary Черновик текущего пользователя
     * @request GET:/api/methods/draft
     * @secure
     */
    methodsDraftList: (params: RequestParams = {}) =>
      this.request<SerializerDraftResponse, void>({
        path: `/api/methods/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Без id возвращает первый опубликованный метод; next=true с id — следующий с переходом к первому. Bearer-токен необязателен.
     *
     * @tags methods
     * @name MethodsFeedList
     * @summary Метод из ленты
     * @request GET:/api/methods/feed
     * @secure
     */
    methodsFeedList: (
      query?: {
        /** ID опубликованного метода */
        id?: number;
        /** Получить следующий метод; требует id */
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerFeedResponse, void>({
        path: `/api/methods/feed`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags methods
     * @name MethodsPublishUpdate
     * @summary Опубликовать черновик
     * @request PUT:/api/methods/publish
     * @secure
     */
    methodsPublishUpdate: (
      request: HandlerPublishDraftRequest,
      params: RequestParams = {},
    ) =>
      this.request<SerializerMethodResponse, void>({
        path: `/api/methods/publish`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersCreate
     * @summary Зарегистрировать пользователя
     * @request POST:/api/users
     */
    usersCreate: (request: HandlerCredentials, params: RequestParams = {}) =>
      this.request<SerializerUser, void>({
        path: `/api/users`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersLoginCreate
     * @summary Вход пользователя
     * @request POST:/api/users/login
     */
    usersLoginCreate: (
      request: HandlerCredentials,
      params: RequestParams = {},
    ) =>
      this.request<SerializerTokenResponse, void>({
        path: `/api/users/login`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет access-токен в Redis-блэклист до истечения срока действия. После ответа удалите токен на клиенте.
     *
     * @tags users
     * @name UsersLogoutCreate
     * @summary Выход пользователя
     * @request POST:/api/users/logout
     * @secure
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/users/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
}
