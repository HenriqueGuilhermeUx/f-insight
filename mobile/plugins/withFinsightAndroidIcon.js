const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content.trimStart(), 'utf8');
}

const colorsXml = `
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <color name="finsight_icon_background">#020617</color>
</resources>
`;

const adaptiveIconXml = `
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/finsight_icon_background" />
  <foreground android:drawable="@drawable/finsight_icon_foreground" />
  <monochrome android:drawable="@drawable/finsight_icon_monochrome" />
</adaptive-icon>
`;

const foregroundVectorXml = `
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="108dp"
  android:height="108dp"
  android:viewportWidth="108"
  android:viewportHeight="108">
  <path android:fillColor="#020617" android:pathData="M0,0h108v108h-108z"/>
  <path android:fillColor="#0E7490" android:pathData="M16,16h76v76h-76z"/>
  <path android:fillColor="#22D3EE" android:pathData="M25,25h37v11h-24v13h21v10h-21v24h-13z"/>
  <path android:fillColor="#FFFFFF" android:pathData="M68,25h14v58h-14z"/>
  <path android:fillColor="#86EFAC" android:pathData="M29,76L45,61L58,68L79,43L84,48L60,78L46,70L34,82z"/>
</vector>
`;

const legacyIconXml = `
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="108dp"
  android:height="108dp"
  android:viewportWidth="108"
  android:viewportHeight="108">
  <path android:fillColor="#020617" android:pathData="M0,0h108v108h-108z"/>
  <path android:fillColor="#0E7490" android:pathData="M18,18h72v72h-72z"/>
  <path android:fillColor="#22D3EE" android:pathData="M27,27h35v11h-22v12h20v10h-20v22h-13z"/>
  <path android:fillColor="#FFFFFF" android:pathData="M68,27h13v55h-13z"/>
  <path android:fillColor="#86EFAC" android:pathData="M31,76L45,63L58,69L78,46L83,51L60,79L46,72L35,82z"/>
</vector>
`;

const monochromeVectorXml = `
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="108dp"
  android:height="108dp"
  android:viewportWidth="108"
  android:viewportHeight="108">
  <path android:fillColor="#FFFFFFFF" android:pathData="M18,18h72v72h-72z"/>
  <path android:fillColor="#FF000000" android:pathData="M27,27h35v11h-22v12h20v10h-20v22h-13z"/>
  <path android:fillColor="#FF000000" android:pathData="M68,27h13v55h-13z"/>
</vector>
`;

const withFinsightAndroidIcon = (config) => {
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const resPath = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res');

      writeFile(path.join(resPath, 'values', 'finsight_icon_colors.xml'), colorsXml);
      writeFile(path.join(resPath, 'drawable', 'finsight_icon_foreground.xml'), foregroundVectorXml);
      writeFile(path.join(resPath, 'drawable', 'finsight_icon_monochrome.xml'), monochromeVectorXml);
      writeFile(path.join(resPath, 'mipmap', 'ic_launcher.xml'), legacyIconXml);
      writeFile(path.join(resPath, 'mipmap-anydpi-v26', 'ic_launcher.xml'), adaptiveIconXml);
      writeFile(path.join(resPath, 'mipmap-anydpi-v26', 'ic_launcher_round.xml'), adaptiveIconXml);

      return config;
    },
  ]);

  config = withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (application?.$) {
      application.$['android:label'] = 'F-Insight';
      application.$['android:icon'] = '@mipmap/ic_launcher';
      application.$['android:roundIcon'] = '@mipmap/ic_launcher_round';
    }
    return config;
  });

  return config;
};

module.exports = withFinsightAndroidIcon;
