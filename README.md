<div align="center">

# <img width="32" height="32" alt="favicon" src="https://github.com/user-attachments/assets/791faa72-b1fb-4604-99c3-f4481b729f35" /> GOG Skyrim Mod Checker

**SMC** — a simple tool to check if Nexus Mods mods are compatible with the GOG version of Skyrim SE.

[🔗 Try it](https://smoochie-code-amateur.github.io/nexus-mods-gog-skyrim/)  |  [🔒 Privacy Policy](https://smoochie-code-amateur.github.io/nexus-mods-gog-skyrim/privacy.html)

</div>

---

## How it works

SMC scans the mod(s) you search for and checks their compatibility with the GOG version of Skyrim against several conditions:

1. **Mod description** - does the author mention that the mod works with all Skyrim editions or the GOG version?
2. **Mod files** - are there GOG-compatible builds in the file list?
3. **Dependencies** - if a mod depends on another mod that is GOG-compatible, the mod itself is likely compatible as well *(work in progress)*.

Additionally, SMC checks:
- ⏱ **SKSE plugins** - if an SKSE plugin hasn't been updated in over a year, it may be incompatible
- 🏷 **File versions** - if file names contain version numbers that don't match the selected game version
- ❌ **Negative markers** - explicit mentions of "Steam only", "not compatible with GOG", etc.

### Voting

Users can vote on mod compatibility (👍 or 👎) so others can see real-world usage experience. One Nexus Mods account = one vote per mod for each game version.

---

## Privacy

SMC is built with privacy in mind:

| | Details |
|---|---|
| 🔑 **API key** | Stored only in your browser (localStorage) |
| 🗄 **Server** | Does not store API keys or search data |
| 🗳 **Votes** | Only a SHA-256 hash of the API key is stored - one-way |
| 🚫 **NEVER stored** | IP addresses, search history, cookies, personal data |

Full privacy policy: [Privacy Policy](https://smoochie-code-amateur.github.io/nexus-mods-gog-skyrim/privacy.html)

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** Cloudflare Workers (API proxy)
- **Database:** Cloudflare D1 (votes)
- **Hosting:** GitHub Pages
- **API:** [Nexus Mods GraphQL API v2](https://graphql.nexusmods.com/)

---

## Contact

Found a bug or have an idea? Create a [GitHub issue](https://github.com/smoochie-code-amateur/nexus-mods-gog-skyrim/issues).

---

<div align="center">

*This tool is designed for personal use and doesn't claim to be perfect. However, any feedback and votes are welcome ❤️*

</div>
