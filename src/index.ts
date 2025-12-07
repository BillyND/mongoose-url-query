/**
 * @file MongoDB Query Toolkit
 *
 * Simple, reusable utilities for MongoDB aggregation queries.
 *
 * @example Basic Usage
 * ```ts
 * import { fetchList, fetchItem } from "mongo-query-toolkit";
 *
 * // Fetch list with pagination & filtering
 * const result = await fetchList(request.url, MyModel, {
 *   tenantValue: shopDomain,
 *   limit: 50,
 * });
 *
 * // Fetch single item
 * const item = await fetchItem(request.url, MyModel);
 * ```
 *
 * @example Filter Parsing
 * ```ts
 * import { parseFilter, buildPipeline, getFiltersFromUrl } from "mongo-query-toolkit";
 *
 * // Parse filter string
 * const filter = parseFilter("status|string|eq|active");
 *
 * // Get filters from URL
 * const filters = getFiltersFromUrl(request.url, shopDomain);
 *
 * // Build MongoDB pipeline
 * const pipeline = buildPipeline(filters);
 * ```
 */

// Types
export type {
  FilterType,
  FilterOperator,
  FilterValue,
  BetweenOperatorValue,
  FetchListResult,
  FetchOptions,
  MultiModelConfig,
} from "./types.js";

// Filter utilities
export {
  parseFilter,
  parseFilters,
  buildPipeline,
  buildPipelineWithPercent,
  getFiltersFromUrl,
} from "./filter.js";

// Fetch utilities
export { fetchList, fetchUnifiedList, fetchItem, fetchItemBy } from "./fetch.js";
