<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Admin portal integration goes through one REST route (`/api/public/admin/<resource>`) guarded by the `ADMIN_API_KEY` header; resources are declared in `src/lib/admin-api/resources.ts` so new ones need no new route files.
