module.exports = {
  'transpileDependencies': [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      externals: ['mysql2/promise'],
      // If you are using Yarn Workspaces, you may have multiple node_modules folders
      // List them all here so that VCP Electron Builder can find them
      nodeModulesPath: ['../../node_modules', './node_modules'],
      builderOptions: {
        appId: 'com.memi.ve',
        nsis: {
          shortcutName: 'xxx nono'
        },
        win: {
          target: [
            {
              target: 'nsis',
              arch: [
                'x64',
                'ia32'
              ]
            }
          ]
        }
      }
    }
  }
}
