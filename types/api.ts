export interface PaginatedResponse<T> {
  data: {
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    content: T[];
    first: boolean;
    last: boolean;
    empty: boolean;
  };
}
