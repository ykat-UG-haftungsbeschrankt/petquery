/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

declare type int8_t = number;
declare type uint8_t = number;
declare type int16_t = number;
declare type uint16_t = number;
declare type int32_t = number;
declare type uint32_t = number;
declare type int64_t = number;
declare type uint64_t = number;
declare type float32_t = number;
declare type float64_t = number;
declare type bool_t = boolean;
declare type size_t = number;
declare type string_t = string;
declare type uint_t = number;
declare type int_t = number;
declare type md5_hex_string_t = string;
declare type utf8_t = string;
declare type uri_t = string;
declare type milliseconds_t = number;
declare type base64_t = string;
declare type mime_t = string;
declare type filename_t = string;
declare type double_t = number;
declare type float_t = number;
declare type port_t = uint16_t;
declare type uuid_t = string;
declare type ip_t = string;
declare type cidr_t = string;

declare type json_string_t = string;
declare type json_number_t = number;
declare type json_boolean_t = boolean;
declare type json_null_t = null;
declare type json_primitive_t = string | number | boolean | null;
declare type json_array_t = json_t[];
declare type json_object_t = { [key: string]: json_t };
declare type json_composite_t = json_array_t | json_object_t;
declare type json_t = json_primitive_t | json_composite_t;


declare type ConstructorType<T> = new (...args:ConstructorParameters<typeof T>) => T;

declare interface Singleton{};