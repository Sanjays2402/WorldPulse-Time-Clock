# 🌍 WorldPulse ULTRA

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

A glassy, neon **multi-timezone dashboard** with massive Orbitron clocks, animated aurora lighting, and live weather mood cards.

## ✨ Features

- 🌌 Deep cosmic background with animated aurora mesh
- 🪟 Frosted glass city cards with per-city neon signatures
- 🕐 Orbitron hero clock for local time
- 🌤️ Animated weather states: sunny, rain, snow, storm, fog, night
- 🌏 Default cities: Tokyo, Dubai, Paris, London, New York, Los Angeles, Sydney, São Paulo
- 🕰️ Luxon-powered timezone rendering
- ☁️ OpenWeatherMap integration with graceful demo fallback
- 🎬 Framer Motion hover lift and pulse behavior
- 🎨 Tailwind-based UI with custom glass utilities
- 📝 Rajdhani labels and HUD-style typography

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite** — fast dev/build
- **Tailwind CSS v4** — utility-first styling
- **Framer Motion** — animations
- **Luxon** — timezone handling
- **Lucide React** — icons

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/Sanjays2402/WorldPulse-Time-Clock.git
cd WorldPulse-Time-Clock

# Install dependencies
npm install

# (Optional) Enable live weather data
echo "VITE_OPENWEATHER_API_KEY=your_api_key_here" > .env

# Start dev server
npm run dev
```

## 📦 Build

```bash
npm run build
```

## 🌦️ Weather Behavior

- If `VITE_OPENWEATHER_API_KEY` is set, cards use **live OpenWeatherMap** current conditions
- If the key is missing or the request fails, the UI falls back to a visually coherent **demo weather mode** so the dashboard still works

## 👤 Author

**Sanjay Santhanam**

## Terms & Disclaimer

By using this project you agree to the following.

- **No warranty.** This software is provided "as is", without warranty of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
- **No liability.** To the maximum extent permitted by law, the author and contributors are not liable for any claim, loss, or damage (direct, indirect, incidental, or consequential, including lost data or profits) arising from its use.
- **Your responsibility.** You use it at your own risk and are responsible for complying with the laws that apply to you.
- **Third parties.** Names, logos, APIs, and services of others belong to their owners and are used for identification only; no affiliation or endorsement is implied.
- **Your statutory rights.** Nothing here limits rights that cannot be waived by agreement, including under consumer-protection laws in the USA, Canada (including Quebec), and India (Consumer Protection Act, 2019).
- **License.** Use, copying, and distribution are governed by the [LICENSE](LICENSE) file; if anything here conflicts with it, the license controls.

## Content, Assets & Fair Use

- **Original work.** Unless noted otherwise (including below), the code, text, design, and images in this repository were created by the author.
- **Libraries, fonts, and icons.** Third-party libraries, fonts (for example Google Fonts), and icon sets belong to their creators and are used under their own licenses; see the dependency manifests and each source for terms.
- **Logos, brands, and screenshots.** Third-party names, logos, and screenshots appear only to identify or describe their products (nominative use). They remain the property of their owners and do not imply affiliation or endorsement.
- **Ideas and inspiration.** Where this project is inspired by another product, game, or idea, it is an independent implementation. It borrows only general ideas, mechanics, or styles, which are not anyone's exclusive property, and is meant to contain no third-party code or artwork used without permission.
- **Fair use and fair dealing.** Any third-party material is used in limited ways for purposes such as education, research, review, commentary, or identification, relying on fair use in the USA (17 U.S.C. § 107), fair dealing in Canada (Copyright Act, ss. 29–29.2), and fair dealing in India (Copyright Act, 1957, s. 52), where they apply.
- **Concerns and takedown requests.** If you own rights in something here and believe it is used improperly, [open an issue](https://github.com/Sanjays2402/WorldPulse-Time-Clock/issues) or contact the author through their GitHub profile with a link to the material and your claim. It will be reviewed promptly and credited, changed, or removed as appropriate. You may also use GitHub's DMCA process.
- **Contributions.** By contributing, you confirm you have the right to submit your contribution and agree it is licensed under this repository's license.
