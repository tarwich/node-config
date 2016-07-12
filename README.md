This project allows you to load config files from the filesystem and have
certain keys be overridden by environment variables.

## Persistent Config

You should make a `config.json` that gets pushed to your repo with changes that
are global / public.

## Private Config

Make a `config.local.json` that is ignored by your [VCS] tool. Store any
sensitive information like passwords in there.

[SCM]: https://www.google.com/search?q=define+version+control+system
