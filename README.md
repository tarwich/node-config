This project allows you to load config files from the filesystem and have
certain keys be overridden by environment variables.

## Persistent Config

You should make a `config.json` that gets pushed to your repo with changes that
are global / public.

## Private Config

Make a `config.local.json` that is ignored by your [VCS] tool. Store any
sensitive information like passwords in there.

[SCM]: https://www.google.com/search?q=define+version+control+system

## Environment Config Overrides

### With dotted paths

It loads all environment keys and overrides their respective path(s) in the config.

#### Example

`config.json`

```json
{
  "database": {
    "href": "test"
  }
}
```

Now if you set this environment variable

```database.href='mongodb://localhost:27017/example'```

It will result in the following config being loaded.

```json
{
  "database": {
    "href": "mongodb://localhost:27017/example"
  }
}
```

> **Naked Values:**
> If an environment variable has dots `.` in it, then it will always be added to the config. Otherwise, the key must exist in the root config in order for the environment variable to be picked up.

### With `environmentMap`

You can set the config value `environmentMap` in order to map simple values to paths.

#### Example

`config.json`

```json
{
  "environmentMap": {
    "PORT": "server.port"
  },
  "server": {
    "port": 80
  }
}
```

Now if you set `PORT=3000`, then the loaded config will look like this:

```json
{
  "environmentMap": {
    "PORT": "server.port"
  },
  "server": {
    "port": 3000
  }
}
```
