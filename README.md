---

## Available Scripts

```bash
npm start             # Launch the Expo development server
npm run android       # Build and run on Android device/emulator
npm run ios           # Build and run on iOS simulator
npm run lint          # Run ESLint for code quality checks
npm run reset-project # ⚠️ Clears template starter code — use with caution
```

---

## Key Features

- **Interactive Dashboard** — Real-time spending summary with quick-action shortcuts
- **Group Splitting** — Create groups, invite friends via links, and track shared balances
- **Advanced Analytics** — Monthly trends and category-wise spending breakdowns
- **Dynamic Theme Engine** — Light/Dark mode with persistent user preferences
- **Offline-Ready Caching** — Intelligent data persistence for slow network conditions

---

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key for user session and auth management |

---

## Known Issues

| Issue | Details |
|---|---|
| Group Invites | `GroupInvite` table is missing from the DB schema — may cause 500 errors when inviting new members |
| Chart Performance | Some Victory Native animations may drop frames on older Android devices; optimization ongoing |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

This project is private and not licensed for public use.