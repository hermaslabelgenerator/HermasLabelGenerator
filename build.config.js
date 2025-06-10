module.exports = {
  appId: 'com.hermas.labelmaker',
  productName: 'Hermas Label Maker',
  buildVersion: '1.0.0',
    asar: true,
    asarUnpack: ['dist/HermasLabelMaker/**/*'],
    directories: {
      output: 'dist',
      buildResources: 'build'
    },
    win: {
      target: ['portable', 'nsis'],
      icon: 'static/Project-Hermas-logo.ico',
      artifactName: '${productName}-${version}-${arch}.${ext}',
      signAndEditExecutable: false
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true
    },
    files: [
      '**/*',
      '!**/*.{o,obj}',
      '!**/node_modules/*/{test,__tests__}',
      '!**/*.map'
    ],
    extraResources: [
      {
        from: 'dist/HermasLabelMaker',
        to: 'app/dist/HermasLabelMaker',
        filter: ['**/*']
      }
    ]
};
