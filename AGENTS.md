# Azalea website agent instructions

For deployment and release work, read and follow the **Production deployments**
section in [CLAUDE.md](CLAUDE.md).

Production releases use Git pushes to `main`. Do not use `vercel alias set` to
move the site's custom domains. Verify that all three custom domains follow the
Git deployment automatically; use promotion only for an intentional release or
recovery as described in the deployment instructions.
