# @rebilly/spinup-cli

Rebilly's customer CLI wrapper of Gridsome to handle the automatic generation of websites. Based on a particular set of templates and components provided directly by Rebilly.


## Commands

The CLI can be accessed globally after being installed as `rebilly-spinup`.

### Create

To create a new project run `create`:
```bash
rebilly-spinup create my-portal billing-portal
```
The second argument specifies the target directory, while third argument specifies the website template. At this time only the `billing-portal` exists in its early stage.

### Developing and Building

After the project is created you can run additional commands from the target folder.

Run a local hot-reload server with `develop`:
```bash
rebilly-spinup develop
```

Build for distribution with `build`:
```bash
rebilly-spinup build
```

Run Gridsome's GraphQL explorer with `explore`:
```bash
rebilly-spinup explore
```
