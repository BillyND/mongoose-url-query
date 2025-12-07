# mongo-query-toolkit

Simple MongoDB aggregation utilities with filtering and pagination.

## Installation

```bash
npm install mongo-query-toolkit
# or
yarn add mongo-query-toolkit
```

## Usage

### Fetch List with Pagination & Filtering

```typescript
import { fetchList } from "mongo-query-toolkit";

// Pass Request object directly (Remix, Next.js, Hono, etc.)
const result = await fetchList(request, MyModel, {
  tenantValue: shopDomain, // Optional: filter by tenant
  limit: 50, // Optional: default 250
});
// => { page: 1, total: 100, items: [...] }

// Or pass URL string
const result = await fetchList(request.url, MyModel, {
  tenantValue: shopDomain,
});
```

### Fetch Single Item

```typescript
import { fetchItem } from "mongo-query-toolkit";

// From URL query param (?id=123)
const item = await fetchItem(request, MyModel);

// Or with explicit ID
const item = await fetchItem(request, MyModel, [], [], "123");
```

### Filter Parsing

```typescript
import {
  parseFilter,
  buildPipeline,
  getFiltersFromUrl,
} from "mongo-query-toolkit";

// Parse single filter string
const filter = parseFilter("status|string|eq|active");

// Get filters from Request or URL
const filters = getFiltersFromUrl(request, shopDomain);

// Build MongoDB pipeline
const pipeline = buildPipeline(filters);
```

### Multi-Model Union Query

```typescript
import { fetchUnifiedList } from "mongo-query-toolkit";

const result = await fetchUnifiedList(
  request,
  [{ model: BoosterModel }, { model: DealModel }],
  { tenantValue: shopDomain }
);
```

## Filter String Format

```
field|type|operator|value
```

**Examples:**

- `status|string|eq|active` - status equals "active"
- `price|amount|gt|100` - price greater than 100
- `createdAt|date|range|2024-01-01~2024-12-31` - date range
- `tags|array|any|a,b,c` - has any of these tags

**Short format (auto-detect type):**

- `status|active` - string contains "active"
- `price|100` - amount equals 100

## Client-Side Usage

### Building Filter URL

```typescript
// Helper function to build URL with filters
function buildQueryUrl(
  baseUrl: string,
  options: {
    page?: number;
    limit?: number;
    sort?: string;
    filters?: string[];
  }
) {
  const params = new URLSearchParams();

  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.sort) params.set("sort", options.sort);
  options.filters?.forEach((f) => params.append("filter", f));

  return `${baseUrl}?${params.toString()}`;
}

// Usage
const url = buildQueryUrl("/api/products", {
  page: 1,
  limit: 20,
  sort: "price|desc",
  filters: [
    "status|string|eq|active",
    "price|amount|gt|100",
    "category|array|any|electronics,books",
  ],
});
// => /api/products?page=1&limit=20&sort=price|desc&filter=status|string|eq|active&filter=price|amount|gt|100&filter=category|array|any|electronics,books
```

### React Example

```tsx
import { useState, useEffect } from "react";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    filters.forEach((f) => params.append("filter", f));

    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.items));
  }, [page, filters]);

  const addFilter = (field: string, value: string) => {
    setFilters([...filters, `${field}|${value}`]);
  };

  return (
    <div>
      <button onClick={() => addFilter("status", "active")}>
        Filter Active
      </button>
      <button onClick={() => addFilter("price|amount|gt", "100")}>
        Price > 100
      </button>
      {/* ... */}
    </div>
  );
}
```

### Remix Example

```tsx
// app/routes/products.tsx
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { fetchList } from "mongo-query-toolkit";

// Server-side loader
export async function loader({ request }: LoaderFunctionArgs) {
  const result = await fetchList(request, ProductModel, {
    tenantValue: shopDomain,
    limit: 20,
  });
  return json(result);
}

// Client-side component
export default function Products() {
  const { items, total, page } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const addFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams);
    params.append("filter", filter);
    setSearchParams(params);
  };

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  return (
    <div>
      <button onClick={() => addFilter("status|string|eq|active")}>
        Active Only
      </button>
      <button onClick={() => addFilter("price|amount|range|100~500")}>
        Price $100-$500
      </button>

      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}

      <button onClick={() => setPage(page - 1)}>Prev</button>
      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
}
```

### Query Parameters Reference

| Parameter         | Description                   | Example                  |
| ----------------- | ----------------------------- | ------------------------ |
| `page`            | Page number (default: 1)      | `?page=2`                |
| `limit`           | Items per page (default: 250) | `?limit=20`              |
| `sort`            | Sort field and direction      | `?sort=price\|desc`      |
| `filter`          | Filter string (can repeat)    | `?filter=status\|active` |
| `id`              | Item ID for `fetchItem`       | `?id=123`                |
| `export`          | Skip pagination               | `?export=true`           |
| `countResultOnly` | Return only total count       | `?countResultOnly=true`  |

## License

MIT
