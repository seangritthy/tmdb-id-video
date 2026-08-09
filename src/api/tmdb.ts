import { env } from "@/utils/env";
import { isEmpty } from "@/utils/helpers";
import { TMDB } from "tmdb-ts";

const fallbackToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ZTEwYmYwNmU0ZjE1ZGFlNmU5ZmYzNWZmMzVlOGRmMiIsIm5iZiI6MTc0MzYwNjI3My45NjIsInN1YiI6IjY3ZWQ1MjAxODM2YzhlZGE3Y2FhZjc4YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.S3sKVtyFQ0kWZRrE4bVGGtw7VAHiEQ2cPUHmFlmmRrg";
const token = env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || fallbackToken;

export const tmdb = new TMDB(token);
