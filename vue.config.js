module.exports = {
  'transpileDependencies': [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.memi.ve',
        nsis: {
          shortcutName: 'xxx nono'
        },
        win: {
          target: [
            {
              target: "nsis",
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
