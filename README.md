# Recruitment App Backend

This project is a backend API for a recruitment application.
It is built with **Node.js**, **Express**, and **PostgreSQL**.

---

## 🚀 How to Run the Project

### 1️⃣ Install dependencies
```bash
npm install

```
backend
├─ .expo
│  ├─ README.md
│  └─ settings.json
├─ add-company-fields-migration.js
├─ backup.sql
├─ create-50-jobs-full-details.js
├─ create-test-jobs.js
├─ create-test-recruiter.js
├─ index.js
├─ index.js.backup
├─ migrations
│  └─ 001_add_profile_columns.js
├─ package-lock.json
├─ package.json
├─ README.md
├─ recruitment-mobile
│  ├─ .expo
│  │  ├─ devices.json
│  │  ├─ packager-info.json
│  │  ├─ README.md
│  │  ├─ settings.json
│  │  ├─ types
│  │  │  └─ router.d.ts
│  │  └─ web
│  │     └─ cache
│  │        └─ production
│  │           └─ images
│  │              ├─ android-adaptive-background
│  │              │  └─ android-adaptive-background-fb139c2dee362ebf2070e23b96da6fc0d43f8492de38b8af1fd7223e19b5861d-cover-transparent
│  │              │     ├─ icon_108.png
│  │              │     ├─ icon_162.png
│  │              │     ├─ icon_216.png
│  │              │     ├─ icon_324.png
│  │              │     └─ icon_432.png
│  │              ├─ android-adaptive-foreground
│  │              │  └─ android-adaptive-foreground-9e3d0315a33c6799de601dd34cd8bf8cc3a8d16f3bf75592baec2ceb7240b391-cover-transparent
│  │              │     ├─ icon_108.png
│  │              │     ├─ icon_162.png
│  │              │     ├─ icon_216.png
│  │              │     ├─ icon_324.png
│  │              │     └─ icon_432.png
│  │              ├─ android-adaptive-monochrome
│  │              │  └─ android-adaptive-monochrome-6371fc2c12e33ad2215a86c281db3d682a81bebe7c957a842c13b8bf00cceb83-cover-transparent
│  │              │     ├─ icon_108.png
│  │              │     ├─ icon_162.png
│  │              │     ├─ icon_216.png
│  │              │     ├─ icon_324.png
│  │              │     └─ icon_432.png
│  │              ├─ android-standard-circle
│  │              │  └─ android-standard-circle-9e3d0315a33c6799de601dd34cd8bf8cc3a8d16f3bf75592baec2ceb7240b391-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ android-standard-round-background
│  │              │  └─ android-standard-round-background-fb139c2dee362ebf2070e23b96da6fc0d43f8492de38b8af1fd7223e19b5861d-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ android-standard-square
│  │              │  └─ android-standard-square-9e3d0315a33c6799de601dd34cd8bf8cc3a8d16f3bf75592baec2ceb7240b391-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ android-standard-square-background
│  │              │  └─ android-standard-square-background-fb139c2dee362ebf2070e23b96da6fc0d43f8492de38b8af1fd7223e19b5861d-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ favicon
│  │              │  └─ favicon-a4e030697a7571b3e95d31860e4da55d2f98e5e861e2b55e414f45a8556828ba-contain-transparent
│  │              │     └─ favicon-48.png
│  │              └─ splash-android
│  │                 └─ splash-android-5f4c0a732b6325bf4071d9124d2ae67e037cb24fcc9c482ef82bea742109a3b8-contain
│  │                    ├─ icon_200.png
│  │                    ├─ icon_300.png
│  │                    ├─ icon_400.png
│  │                    ├─ icon_600.png
│  │                    └─ icon_800.png
│  ├─ android
│  │  ├─ app
│  │  │  ├─ build.gradle
│  │  │  ├─ debug.keystore
│  │  │  ├─ proguard-rules.pro
│  │  │  └─ src
│  │  │     ├─ debug
│  │  │     │  └─ AndroidManifest.xml
│  │  │     ├─ debugOptimized
│  │  │     │  └─ AndroidManifest.xml
│  │  │     └─ main
│  │  │        ├─ AndroidManifest.xml
│  │  │        ├─ java
│  │  │        │  └─ com
│  │  │        │     └─ amsman3110
│  │  │        │        └─ recruitmentapp
│  │  │        │           ├─ MainActivity.kt
│  │  │        │           └─ MainApplication.kt
│  │  │        └─ res
│  │  │           ├─ drawable
│  │  │           │  ├─ ic_launcher_background.xml
│  │  │           │  └─ rn_edit_text_material.xml
│  │  │           ├─ drawable-hdpi
│  │  │           │  └─ splashscreen_logo.png
│  │  │           ├─ drawable-mdpi
│  │  │           │  └─ splashscreen_logo.png
│  │  │           ├─ drawable-xhdpi
│  │  │           │  └─ splashscreen_logo.png
│  │  │           ├─ drawable-xxhdpi
│  │  │           │  └─ splashscreen_logo.png
│  │  │           ├─ drawable-xxxhdpi
│  │  │           │  └─ splashscreen_logo.png
│  │  │           ├─ mipmap-anydpi-v26
│  │  │           │  ├─ ic_launcher.xml
│  │  │           │  └─ ic_launcher_round.xml
│  │  │           ├─ mipmap-hdpi
│  │  │           │  ├─ ic_launcher.webp
│  │  │           │  ├─ ic_launcher_background.webp
│  │  │           │  ├─ ic_launcher_foreground.webp
│  │  │           │  ├─ ic_launcher_monochrome.webp
│  │  │           │  └─ ic_launcher_round.webp
│  │  │           ├─ mipmap-mdpi
│  │  │           │  ├─ ic_launcher.webp
│  │  │           │  ├─ ic_launcher_background.webp
│  │  │           │  ├─ ic_launcher_foreground.webp
│  │  │           │  ├─ ic_launcher_monochrome.webp
│  │  │           │  └─ ic_launcher_round.webp
│  │  │           ├─ mipmap-xhdpi
│  │  │           │  ├─ ic_launcher.webp
│  │  │           │  ├─ ic_launcher_background.webp
│  │  │           │  ├─ ic_launcher_foreground.webp
│  │  │           │  ├─ ic_launcher_monochrome.webp
│  │  │           │  └─ ic_launcher_round.webp
│  │  │           ├─ mipmap-xxhdpi
│  │  │           │  ├─ ic_launcher.webp
│  │  │           │  ├─ ic_launcher_background.webp
│  │  │           │  ├─ ic_launcher_foreground.webp
│  │  │           │  ├─ ic_launcher_monochrome.webp
│  │  │           │  └─ ic_launcher_round.webp
│  │  │           ├─ mipmap-xxxhdpi
│  │  │           │  ├─ ic_launcher.webp
│  │  │           │  ├─ ic_launcher_background.webp
│  │  │           │  ├─ ic_launcher_foreground.webp
│  │  │           │  ├─ ic_launcher_monochrome.webp
│  │  │           │  └─ ic_launcher_round.webp
│  │  │           ├─ values
│  │  │           │  ├─ colors.xml
│  │  │           │  ├─ strings.xml
│  │  │           │  └─ styles.xml
│  │  │           └─ values-night
│  │  │              └─ colors.xml
│  │  ├─ build.gradle
│  │  ├─ gradle
│  │  │  └─ wrapper
│  │  │     ├─ gradle-wrapper.jar
│  │  │     └─ gradle-wrapper.properties
│  │  ├─ gradle.properties
│  │  ├─ gradlew
│  │  ├─ gradlew.bat
│  │  └─ settings.gradle
│  ├─ app
│  │  ├─ (auth)
│  │  │  ├─ candidate-login.tsx.backup.tsx
│  │  │  ├─ login-type.tsx.backup.tsx
│  │  │  ├─ login.js
│  │  │  ├─ recruiter-login- backup.tsx
│  │  │  ├─ recruiter-login.js
│  │  │  ├─ recruiter-register.js
│  │  │  ├─ register.js
│  │  │  └─ _layout.tsx
│  │  ├─ (recruiter-tabs)
│  │  │  ├─ candidates.js
│  │  │  ├─ company-profile.js
│  │  │  ├─ index.js
│  │  │  ├─ jobs.js
│  │  │  └─ _layout.js
│  │  ├─ (tabs)
│  │  │  ├─ career-coach.tsx
│  │  │  ├─ edit-profile.jsx
│  │  │  ├─ index.tsx
│  │  │  ├─ jobs.tsx
│  │  │  ├─ profile.jsx
│  │  │  └─ _layout.js
│  │  ├─ candidate-detail.js
│  │  ├─ candidate-settings.js
│  │  ├─ edit-company-profile.tsx
│  │  ├─ hooks
│  │  │  └─ useLogout.js
│  │  ├─ index.js
│  │  ├─ index.tsx.backup.tsx
│  │  ├─ job-detail.tsx
│  │  ├─ job-post.tsx
│  │  ├─ modal.tsx
│  │  ├─ recruiter-settings.js
│  │  ├─ services
│  │  │  ├─ api.js
│  │  │  ├─ auth.js
│  │  │  └─ tokenStorage.ts
│  │  └─ _layout.js
│  ├─ app.json
│  ├─ assets
│  │  └─ images
│  │     ├─ android-icon-background.png
│  │     ├─ android-icon-foreground.png
│  │     ├─ android-icon-monochrome.png
│  │     ├─ avatar-placeholder.png
│  │     ├─ favicon.png
│  │     ├─ icon.png
│  │     ├─ partial-react-logo.png
│  │     ├─ react-logo.png
│  │     ├─ react-logo@2x.png
│  │     ├─ react-logo@3x.png
│  │     └─ splash-icon.png
│  ├─ components
│  │  ├─ external-link.tsx
│  │  ├─ haptic-tab.tsx
│  │  ├─ hello-wave.tsx
│  │  ├─ parallax-scroll-view.tsx
│  │  ├─ themed-text.tsx
│  │  ├─ themed-view.tsx
│  │  └─ ui
│  │     ├─ collapsible.tsx
│  │     ├─ icon-symbol.ios.tsx
│  │     └─ icon-symbol.tsx
│  ├─ constants
│  │  ├─ filterData.js
│  │  ├─ profileData.js
│  │  └─ theme.ts
│  ├─ dist
│  │  ├─ (auth)
│  │  │  ├─ login.html
│  │  │  └─ register.html
│  │  ├─ (tabs)
│  │  │  ├─ explore.html
│  │  │  ├─ index.html
│  │  │  └─ jobs.html
│  │  ├─ +not-found.html
│  │  ├─ assetmap.json
│  │  ├─ assets
│  │  │  ├─ 017bc6ba3fc25503e5eb5e53826d48a8
│  │  │  ├─ 02bc1fa7c0313217bde2d65ccbff40c9
│  │  │  ├─ 069d99eb1fa6712c0b9034a58c6b57dd
│  │  │  ├─ 0747a1317bbe9c6fc340b889ef8ab3ae
│  │  │  ├─ 0a328cd9c1afd0afe8e3b1ec5165b1b4
│  │  │  ├─ 0ea69b5077e7c4696db85dbcba75b0e1
│  │  │  ├─ 1190ab078c57159f4245a328118fcd9a
│  │  │  ├─ 19eeb73b9593a38f8e9f418337fc7d10
│  │  │  ├─ 20e71bdf79e3a97bf55fd9e164041578
│  │  │  ├─ 286d67d3f74808a60a78d3ebf1a5fb57
│  │  │  ├─ 2d0a9133e39524f138be6d4db9f4851f
│  │  │  ├─ 35ba0eaec5a4f5ed12ca16fabeae451d
│  │  │  ├─ 3cd68ccdb8938e3711da2e8831b85493
│  │  │  ├─ 412dd9275b6b48ad28f5e3d81bb1f626
│  │  │  ├─ 4403c6117ec30c859bc95d70ce4a71d3
│  │  │  ├─ 4e85bc9ebe07e0340c9c4fc2f6c38908
│  │  │  ├─ 61ca7e64b7d605716c57706cef640b9a
│  │  │  ├─ 695d5a1c6f29a689130f3aaa573aec6e
│  │  │  ├─ 778ffc9fe8773a878e9c30a6304784de
│  │  │  ├─ 78c625386b4d0690b421eb0fc78f7b9c
│  │  │  ├─ 7d40544b395c5949f4646f5e150fe020
│  │  │  ├─ 8a4d0e5b845044e56e3b2df627d01cfd
│  │  │  ├─ a132ecc4ba5c1517ff83c0fb321bc7fc
│  │  │  ├─ ab19f4cbc543357183a20571f68380a3
│  │  │  ├─ aff2c65b39a296d4f7e96d0f58169170
│  │  │  ├─ assets
│  │  │  │  └─ images
│  │  │  │     ├─ react-logo.d883906de993aa65bf0ef0d1bc2ff6ad.png
│  │  │  │     ├─ react-logo.d883906de993aa65bf0ef0d1bc2ff6ad@2x.png
│  │  │  │     └─ react-logo.d883906de993aa65bf0ef0d1bc2ff6ad@3x.png
│  │  │  ├─ b507e7f2c91ebc8fe24dee79ccb3b600
│  │  │  ├─ c3273c9e5321f20d1e42c2efae2578c4
│  │  │  ├─ c79c3606a1cf168006ad3979763c7e0c
│  │  │  ├─ d1ea1496f9057eb392d5bbf3732a61b7
│  │  │  ├─ d62ddc38b69aff346c20a28774933d6a
│  │  │  ├─ d84e297c3b3e49a614248143d53e40ca
│  │  │  ├─ d8b800c443b8972542883e0b9de2bdc6
│  │  │  ├─ d8e7601e3df962f83c62371ac14964d8
│  │  │  ├─ dad2fa9f4394a630f0f9a0d6dabd44bc
│  │  │  └─ f3a81967828232c893d547162e922764
│  │  ├─ explore.html
│  │  ├─ favicon.ico
│  │  ├─ index.html
│  │  ├─ job-detail.html
│  │  ├─ jobs.html
│  │  ├─ login.html
│  │  ├─ metadata.json
│  │  ├─ modal.html
│  │  ├─ register.html
│  │  ├─ services
│  │  │  ├─ api.html
│  │  │  └─ tokenStorage.html
│  │  ├─ _expo
│  │  │  ├─ .routes.json
│  │  │  └─ static
│  │  │     └─ js
│  │  │        ├─ android
│  │  │        │  ├─ entry-6c72d804b437749eb649c781146bb78e.hbc
│  │  │        │  └─ entry-6c72d804b437749eb649c781146bb78e.hbc.map
│  │  │        ├─ ios
│  │  │        │  ├─ entry-ea1bb8e054769135d2076157b13bfb8a.hbc
│  │  │        │  └─ entry-ea1bb8e054769135d2076157b13bfb8a.hbc.map
│  │  │        └─ web
│  │  │           ├─ entry-662d3f19f61ebf807b33cec85e8d587a.js
│  │  │           └─ entry-662d3f19f61ebf807b33cec85e8d587a.js.map
│  │  └─ _sitemap.html
│  ├─ eslint.config.js
│  ├─ expo-env.d.ts
│  ├─ hooks
│  │  ├─ use-color-scheme.ts
│  │  ├─ use-color-scheme.web.ts
│  │  ├─ use-theme-color.ts
│  │  └─ useLogout.js
│  ├─ index.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ scripts
│  │  └─ reset-project.js
│  └─ tsconfig.json
├─ refresh.txt
├─ setup-database.js
├─ src
│  ├─ db.js
│  ├─ middleware
│  │  ├─ auth.js
│  │  └─ role.js
│  ├─ routes
│  │  ├─ applications.js
│  │  ├─ auth.js
│  │  ├─ candidates.js
│  │  ├─ company.js
│  │  ├─ invitations.js
│  │  ├─ jobs.js
│  │  ├─ pipeline.js
│  │  ├─ questions.js
│  │  ├─ recruiter-search.js
│  │  ├─ recruiters.js
│  │  └─ update-profile.js
│  └─ schema.sql
├─ uploads
│  └─ photos
│     └─ CV
└─ write-file.js

```
```
backend
├─ .expo
│  ├─ README.md
│  └─ settings.json
├─ add-company-fields-migration.js
├─ backup.sql
├─ create-50-jobs-full-details.js
├─ create-test-jobs.js
├─ create-test-recruiter.js
├─ index.js
├─ index.js.backup
├─ migrations
│  └─ 001_add_profile_columns.js
├─ package-lock.json
├─ package.json
├─ README.md
├─ recruitment-mobile
│  ├─ .expo
│  │  ├─ devices.json
│  │  ├─ packager-info.json
│  │  ├─ README.md
│  │  ├─ settings.json
│  │  ├─ types
│  │  │  └─ router.d.ts
│  │  └─ web
│  │     └─ cache
│  │        └─ production
│  │           └─ images
│  │              ├─ android-adaptive-background
│  │              │  └─ android-adaptive-background-fb139c2dee362ebf2070e23b96da6fc0d43f8492de38b8af1fd7223e19b5861d-cover-transparent
│  │              │     ├─ icon_108.png
│  │              │     ├─ icon_162.png
│  │              │     ├─ icon_216.png
│  │              │     ├─ icon_324.png
│  │              │     └─ icon_432.png
│  │              ├─ android-adaptive-foreground
│  │              │  └─ android-adaptive-foreground-9e3d0315a33c6799de601dd34cd8bf8cc3a8d16f3bf75592baec2ceb7240b391-cover-transparent
│  │              │     ├─ icon_108.png
│  │              │     ├─ icon_162.png
│  │              │     ├─ icon_216.png
│  │              │     ├─ icon_324.png
│  │              │     └─ icon_432.png
│  │              ├─ android-adaptive-monochrome
│  │              │  └─ android-adaptive-monochrome-6371fc2c12e33ad2215a86c281db3d682a81bebe7c957a842c13b8bf00cceb83-cover-transparent
│  │              │     ├─ icon_108.png
│  │              │     ├─ icon_162.png
│  │              │     ├─ icon_216.png
│  │              │     ├─ icon_324.png
│  │              │     └─ icon_432.png
│  │              ├─ android-standard-circle
│  │              │  └─ android-standard-circle-9e3d0315a33c6799de601dd34cd8bf8cc3a8d16f3bf75592baec2ceb7240b391-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ android-standard-round-background
│  │              │  └─ android-standard-round-background-fb139c2dee362ebf2070e23b96da6fc0d43f8492de38b8af1fd7223e19b5861d-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ android-standard-square
│  │              │  └─ android-standard-square-9e3d0315a33c6799de601dd34cd8bf8cc3a8d16f3bf75592baec2ceb7240b391-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ android-standard-square-background
│  │              │  └─ android-standard-square-background-fb139c2dee362ebf2070e23b96da6fc0d43f8492de38b8af1fd7223e19b5861d-cover-transparent
│  │              │     ├─ icon_144.png
│  │              │     ├─ icon_192.png
│  │              │     ├─ icon_48.png
│  │              │     ├─ icon_72.png
│  │              │     └─ icon_96.png
│  │              ├─ favicon
│  │              │  └─ favicon-a4e030697a7571b3e95d31860e4da55d2f98e5e861e2b55e414f45a8556828ba-contain-transparent
│  │              │     └─ favicon-48.png
│  │              └─ splash-android
│  │                 └─ splash-android-5f4c0a732b6325bf4071d9124d2ae67e037cb24fcc9c482ef82bea742109a3b8-contain
│  │                    ├─ icon_200.png
│  │                    ├─ icon_300.png
│  │                    ├─ icon_400.png
│  │                    ├─ icon_600.png
│  │                    └─ icon_800.png
│  ├─ android
│  │  ├─ app
│  │  │  ├─ build.gradle
│  │  │  ├─ debug.keystore
│  │  │  ├─ proguard-rules.pro
│  │  │  └─ src
│  │  │     ├─ debug
│  │  │     │  └─ AndroidManifest.xml
│  │  │     ├─ debugOptimized
│  │  │     │  └─ AndroidManifest.xml
│  │  │     └─ main
│  │  │        ├─ AndroidManifest.xml
│  │  │        ├─ java
│  │  │        │  └─ com
│  │  │        │     └─ amsman3110
│  │  │        │        └─ recruitmentapp
│  │  │        │           ├─ MainActivity.kt
│  │  │        │           └─ MainApplication.kt
│  │  │        └─ res
│  │  │           ├─ drawable
│  │  │           │  ├─ ic_launcher_background.xml
│  │  │           │  └─ rn_edit_text_material.xml
│  │  │           ├─ drawable-hdpi
│  │  │           │  └─ splashscreen_logo.png
│  │  │           ├─ drawable-mdpi
│  │  │           │  └─ splashscreen_logo.png
│  │  │           ├─ drawable-xhdpi
│  │  │           │  └─ splashscreen_logo.png
│  │  │           ├─ drawable-xxhdpi
│  │  │           │  └─ splashscreen_logo.png
│  │  │           ├─ drawable-xxxhdpi
│  │  │           │  └─ splashscreen_logo.png
│  │  │           ├─ mipmap-anydpi-v26
│  │  │           │  ├─ ic_launcher.xml
│  │  │           │  └─ ic_launcher_round.xml
│  │  │           ├─ mipmap-hdpi
│  │  │           │  ├─ ic_launcher.webp
│  │  │           │  ├─ ic_launcher_background.webp
│  │  │           │  ├─ ic_launcher_foreground.webp
│  │  │           │  ├─ ic_launcher_monochrome.webp
│  │  │           │  └─ ic_launcher_round.webp
│  │  │           ├─ mipmap-mdpi
│  │  │           │  ├─ ic_launcher.webp
│  │  │           │  ├─ ic_launcher_background.webp
│  │  │           │  ├─ ic_launcher_foreground.webp
│  │  │           │  ├─ ic_launcher_monochrome.webp
│  │  │           │  └─ ic_launcher_round.webp
│  │  │           ├─ mipmap-xhdpi
│  │  │           │  ├─ ic_launcher.webp
│  │  │           │  ├─ ic_launcher_background.webp
│  │  │           │  ├─ ic_launcher_foreground.webp
│  │  │           │  ├─ ic_launcher_monochrome.webp
│  │  │           │  └─ ic_launcher_round.webp
│  │  │           ├─ mipmap-xxhdpi
│  │  │           │  ├─ ic_launcher.webp
│  │  │           │  ├─ ic_launcher_background.webp
│  │  │           │  ├─ ic_launcher_foreground.webp
│  │  │           │  ├─ ic_launcher_monochrome.webp
│  │  │           │  └─ ic_launcher_round.webp
│  │  │           ├─ mipmap-xxxhdpi
│  │  │           │  ├─ ic_launcher.webp
│  │  │           │  ├─ ic_launcher_background.webp
│  │  │           │  ├─ ic_launcher_foreground.webp
│  │  │           │  ├─ ic_launcher_monochrome.webp
│  │  │           │  └─ ic_launcher_round.webp
│  │  │           ├─ values
│  │  │           │  ├─ colors.xml
│  │  │           │  ├─ strings.xml
│  │  │           │  └─ styles.xml
│  │  │           └─ values-night
│  │  │              └─ colors.xml
│  │  ├─ build.gradle
│  │  ├─ gradle
│  │  │  └─ wrapper
│  │  │     ├─ gradle-wrapper.jar
│  │  │     └─ gradle-wrapper.properties
│  │  ├─ gradle.properties
│  │  ├─ gradlew
│  │  ├─ gradlew.bat
│  │  └─ settings.gradle
│  ├─ app
│  │  ├─ (auth)
│  │  │  ├─ candidate-login.tsx.backup.tsx
│  │  │  ├─ login-type.tsx.backup.tsx
│  │  │  ├─ login.js
│  │  │  ├─ recruiter-login- backup.tsx
│  │  │  ├─ recruiter-login.js
│  │  │  ├─ recruiter-register.js
│  │  │  ├─ register.js
│  │  │  └─ _layout.tsx
│  │  ├─ (recruiter-tabs)
│  │  │  ├─ candidates.js
│  │  │  ├─ company-profile.js
│  │  │  ├─ index.js
│  │  │  ├─ jobs.js
│  │  │  └─ _layout.js
│  │  ├─ (tabs)
│  │  │  ├─ career-coach.tsx
│  │  │  ├─ edit-profile.jsx
│  │  │  ├─ index.tsx
│  │  │  ├─ jobs.tsx
│  │  │  ├─ profile.jsx
│  │  │  └─ _layout.js
│  │  ├─ candidate-detail.js
│  │  ├─ candidate-settings.js
│  │  ├─ edit-company-profile.tsx
│  │  ├─ hooks
│  │  │  └─ useLogout.js
│  │  ├─ index.js
│  │  ├─ index.tsx.backup.tsx
│  │  ├─ job-detail.tsx
│  │  ├─ job-post.tsx
│  │  ├─ modal.tsx
│  │  ├─ recruiter-settings.js
│  │  ├─ services
│  │  │  ├─ api.js
│  │  │  ├─ auth.js
│  │  │  └─ tokenStorage.ts
│  │  └─ _layout.js
│  ├─ app.json
│  ├─ assets
│  │  └─ images
│  │     ├─ android-icon-background.png
│  │     ├─ android-icon-foreground.png
│  │     ├─ android-icon-monochrome.png
│  │     ├─ avatar-placeholder.png
│  │     ├─ favicon.png
│  │     ├─ icon.png
│  │     ├─ partial-react-logo.png
│  │     ├─ react-logo.png
│  │     ├─ react-logo@2x.png
│  │     ├─ react-logo@3x.png
│  │     └─ splash-icon.png
│  ├─ components
│  │  ├─ external-link.tsx
│  │  ├─ haptic-tab.tsx
│  │  ├─ hello-wave.tsx
│  │  ├─ parallax-scroll-view.tsx
│  │  ├─ themed-text.tsx
│  │  ├─ themed-view.tsx
│  │  └─ ui
│  │     ├─ collapsible.tsx
│  │     ├─ icon-symbol.ios.tsx
│  │     └─ icon-symbol.tsx
│  ├─ constants
│  │  ├─ filterData.js
│  │  ├─ profileData.js
│  │  └─ theme.ts
│  ├─ dist
│  │  ├─ (auth)
│  │  │  ├─ login.html
│  │  │  └─ register.html
│  │  ├─ (tabs)
│  │  │  ├─ explore.html
│  │  │  ├─ index.html
│  │  │  └─ jobs.html
│  │  ├─ +not-found.html
│  │  ├─ assetmap.json
│  │  ├─ assets
│  │  │  ├─ 017bc6ba3fc25503e5eb5e53826d48a8
│  │  │  ├─ 02bc1fa7c0313217bde2d65ccbff40c9
│  │  │  ├─ 069d99eb1fa6712c0b9034a58c6b57dd
│  │  │  ├─ 0747a1317bbe9c6fc340b889ef8ab3ae
│  │  │  ├─ 0a328cd9c1afd0afe8e3b1ec5165b1b4
│  │  │  ├─ 0ea69b5077e7c4696db85dbcba75b0e1
│  │  │  ├─ 1190ab078c57159f4245a328118fcd9a
│  │  │  ├─ 19eeb73b9593a38f8e9f418337fc7d10
│  │  │  ├─ 20e71bdf79e3a97bf55fd9e164041578
│  │  │  ├─ 286d67d3f74808a60a78d3ebf1a5fb57
│  │  │  ├─ 2d0a9133e39524f138be6d4db9f4851f
│  │  │  ├─ 35ba0eaec5a4f5ed12ca16fabeae451d
│  │  │  ├─ 3cd68ccdb8938e3711da2e8831b85493
│  │  │  ├─ 412dd9275b6b48ad28f5e3d81bb1f626
│  │  │  ├─ 4403c6117ec30c859bc95d70ce4a71d3
│  │  │  ├─ 4e85bc9ebe07e0340c9c4fc2f6c38908
│  │  │  ├─ 61ca7e64b7d605716c57706cef640b9a
│  │  │  ├─ 695d5a1c6f29a689130f3aaa573aec6e
│  │  │  ├─ 778ffc9fe8773a878e9c30a6304784de
│  │  │  ├─ 78c625386b4d0690b421eb0fc78f7b9c
│  │  │  ├─ 7d40544b395c5949f4646f5e150fe020
│  │  │  ├─ 8a4d0e5b845044e56e3b2df627d01cfd
│  │  │  ├─ a132ecc4ba5c1517ff83c0fb321bc7fc
│  │  │  ├─ ab19f4cbc543357183a20571f68380a3
│  │  │  ├─ aff2c65b39a296d4f7e96d0f58169170
│  │  │  ├─ assets
│  │  │  │  └─ images
│  │  │  │     ├─ react-logo.d883906de993aa65bf0ef0d1bc2ff6ad.png
│  │  │  │     ├─ react-logo.d883906de993aa65bf0ef0d1bc2ff6ad@2x.png
│  │  │  │     └─ react-logo.d883906de993aa65bf0ef0d1bc2ff6ad@3x.png
│  │  │  ├─ b507e7f2c91ebc8fe24dee79ccb3b600
│  │  │  ├─ c3273c9e5321f20d1e42c2efae2578c4
│  │  │  ├─ c79c3606a1cf168006ad3979763c7e0c
│  │  │  ├─ d1ea1496f9057eb392d5bbf3732a61b7
│  │  │  ├─ d62ddc38b69aff346c20a28774933d6a
│  │  │  ├─ d84e297c3b3e49a614248143d53e40ca
│  │  │  ├─ d8b800c443b8972542883e0b9de2bdc6
│  │  │  ├─ d8e7601e3df962f83c62371ac14964d8
│  │  │  ├─ dad2fa9f4394a630f0f9a0d6dabd44bc
│  │  │  └─ f3a81967828232c893d547162e922764
│  │  ├─ explore.html
│  │  ├─ favicon.ico
│  │  ├─ index.html
│  │  ├─ job-detail.html
│  │  ├─ jobs.html
│  │  ├─ login.html
│  │  ├─ metadata.json
│  │  ├─ modal.html
│  │  ├─ register.html
│  │  ├─ services
│  │  │  ├─ api.html
│  │  │  └─ tokenStorage.html
│  │  ├─ _expo
│  │  │  ├─ .routes.json
│  │  │  └─ static
│  │  │     └─ js
│  │  │        ├─ android
│  │  │        │  ├─ entry-6c72d804b437749eb649c781146bb78e.hbc
│  │  │        │  └─ entry-6c72d804b437749eb649c781146bb78e.hbc.map
│  │  │        ├─ ios
│  │  │        │  ├─ entry-ea1bb8e054769135d2076157b13bfb8a.hbc
│  │  │        │  └─ entry-ea1bb8e054769135d2076157b13bfb8a.hbc.map
│  │  │        └─ web
│  │  │           ├─ entry-662d3f19f61ebf807b33cec85e8d587a.js
│  │  │           └─ entry-662d3f19f61ebf807b33cec85e8d587a.js.map
│  │  └─ _sitemap.html
│  ├─ eslint.config.js
│  ├─ expo-env.d.ts
│  ├─ hooks
│  │  ├─ use-color-scheme.ts
│  │  ├─ use-color-scheme.web.ts
│  │  ├─ use-theme-color.ts
│  │  └─ useLogout.js
│  ├─ index.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ scripts
│  │  └─ reset-project.js
│  └─ tsconfig.json
├─ refresh.txt
├─ setup-database.js
├─ src
│  ├─ db.js
│  ├─ middleware
│  │  ├─ auth.js
│  │  └─ role.js
│  ├─ routes
│  │  ├─ applications.js
│  │  ├─ auth.js
│  │  ├─ candidates.js
│  │  ├─ company.js
│  │  ├─ invitations.js
│  │  ├─ jobs.js
│  │  ├─ pipeline.js
│  │  ├─ questions.js
│  │  ├─ recruiter-search.js
│  │  ├─ recruiters.js
│  │  └─ update-profile.js
│  └─ schema.sql
├─ uploads
│  └─ photos
│     └─ CV
└─ write-file.js

```