# Vīnm CLI

[![pipeline status](https://gitlab.com/vinm/vinm-cli/badges/master/pipeline.svg)](https://gitlab.com/vinm/vinm-cli/commits/master)

> Tiny CLI that help developers create robust execution pipelines.

It can be challenging to deploy microservices architectures at scale, even more, if you like to create decoupled infrastructures as code. Vinm is a tiny CLI that help developers create robust execution pipelines and reduce software deployment anxiety.

Few things Vinm can help with:

- Build and deploy a fleet of services via a single command.
- Easily manage infrastructure as code for decoupled architectures.
- Orchestrate deployments for Serverless, AWS CDK and more.


## 📦 CLI installation

```sh
# With npm
npm i -g vinm-cli

# OR With yarn
yarn global add vinm-cli
```


## ⚙️ Project setup

Create a `vinm.yml` file at the root of your project.

Sample:

```yaml
project: hello-world

stages:
    staging:
        message: world

tasks:
    hello:
        description: Say "hello"
        shell: >-
            echo "hello"
    world:
        description: Say "world"
        shell: >-
            echo "$vinm.message"

pipelines:
    helloWorld:
        - task: hello
        - task: world
```


## 🚀 CLI usage

```sh
Usage
    $ vinm <pipeline> <options>
    $ vinm @<task> <options>

Options
    --stage, -s     Stage vars to use    # optional
    --force, -f     Force run all tasks  # optional
    --help, -h      Show help            # optional
    --version, -v   Current version      # optional 

Examples
    $ vinm deploy                        # run 'deploy' pipeline
    $ vinm @api-create                   # run 'api-create' task
```

Sample:

```sh
vinm helloworld
```


## 🤝 Contributing

Contributions, issues and feature requests are welcome on the [Gitlab repository](https://gitlab.com/vinm/vinm-cli).


## 📝 License

Copyright © 2020 [maoosi](https://gitlab.com/maoosi).<br />
This project is [MIT](./LICENSE) licensed.
