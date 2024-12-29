# Client Application

A modern web application built with Next.js 15, React 19, and TypeScript, featuring a robust UI component system and form handling capabilities.

## Features

- Modern React components built with Radix UI primitives
- Form handling with React Hook Form and Zod validation
- File upload capabilities using React Dropzone
- Beautiful UI with Tailwind CSS and custom animations
- Toast notifications using Sonner
- Type-safe development with TypeScript

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **UI Components:**
  - Radix UI primitives for accessible components
  - Custom UI components with Tailwind CSS
  - Class Variance Authority for component variants
- **Styling:**
  - Tailwind CSS for utility-first styling
  - tailwindcss-animate for animations
  - tailwind-merge for class merging
- **Form Management:**
  - React Hook Form for form handling
  - Zod for schema validation
- **HTTP Client:** Axios for API requests
- **Development Tools:**
  - TypeScript for type safety
  - ESLint for code linting
  - Prettier for code formatting

## Components

### AspectRatio

A utility component for maintaining consistent width-to-height ratios:

```tsx
<AspectRatio ratio={16 / 9}>
  <img src="..." alt="..." />
</AspectRatio>
```

### Label

Accessible form labels that can be associated with form controls:

```tsx
<Label htmlFor="input">Field Label</Label>
```

### Slot

A utility component for component composition:

```tsx
<Slot onClick={...}>
  {children}
</Slot>
```

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Run the development server:

```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view the application

## Development

- The application uses the App Router pattern from Next.js
- Components are organized in the `src/components` directory
- UI components are built using a combination of Radix UI primitives and custom styling
- Forms are handled using React Hook Form with Zod schemas for validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and confidential.
