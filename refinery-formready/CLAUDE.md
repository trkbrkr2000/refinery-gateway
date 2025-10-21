# FormReady Frontend - Development Guide

## Atomic Design Principles

This project follows **Atomic Design** methodology for building a scalable, maintainable component library.

### Component Structure

```
components/
├── atoms/           # Basic building blocks
│   ├── Button.vue
│   ├── Input.vue
│   ├── Label.vue
│   ├── Icon.vue
│   └── Badge.vue
├── molecules/       # Simple combinations of atoms
│   ├── FormField.vue
│   ├── SearchBar.vue
│   ├── Card.vue
│   └── Alert.vue
├── organisms/       # Complex UI components
│   ├── FormSection.vue
│   ├── Header.vue
│   ├── Footer.vue
│   └── Sidebar.vue
├── templates/       # Page-level layouts
│   ├── FormLayout.vue
│   └── DashboardLayout.vue
└── pages/           # Specific page instances (Nuxt auto-routing)
    ├── index.vue
    └── forms/
        └── [id].vue
```

### Design System Rules

#### **Atoms** (Building Blocks)
- Single-purpose, reusable components
- No dependencies on other components
- Highly configurable via props
- Example: `Button`, `Input`, `Icon`

```vue
<!-- components/atoms/Button.vue -->
<template>
  <button 
    :class="buttonClasses"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>()

const buttonClasses = computed(() => ({
  'btn': true,
  [`btn-${props.variant || 'primary'}`]: true,
  [`btn-${props.size || 'md'}`]: true,
  'btn-disabled': props.disabled
}))
</script>
```

#### **Molecules** (Simple Combinations)
- Combine atoms into functional units
- Handle basic interactions
- Still reusable across pages
- Example: `FormField` (Label + Input + Error)

```vue
<!-- components/molecules/FormField.vue -->
<template>
  <div class="form-field">
    <Label :for="id" :required="required">
      {{ label }}
    </Label>
    <Input 
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
    <p v-if="error" class="error-text">{{ error }}</p>
    <p v-if="help" class="help-text">{{ help }}</p>
  </div>
</template>

<script setup lang="ts">
import Label from '~/components/atoms/Label.vue'
import Input from '~/components/atoms/Input.vue'

defineProps<{
  id: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  modelValue?: string
  error?: string
  help?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
```

#### **Organisms** (Complex Components)
- Combine molecules and atoms
- Form distinct sections of an interface
- May fetch data or manage state
- Example: `FormSection` (multiple FormFields + validation)

```vue
<!-- components/organisms/FormSection.vue -->
<template>
  <section class="form-section">
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    
    <div class="form-fields">
      <FormField
        v-for="field in fields"
        :key="field.id"
        v-bind="field"
        :modelValue="formData[field.id]"
        @update:modelValue="updateField(field.id, $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import FormField from '~/components/molecules/FormField.vue'

const props = defineProps<{
  title: string
  description?: string
  fields: FormFieldConfig[]
}>()

const formData = ref<Record<string, any>>({})

function updateField(id: string, value: any) {
  formData.value[id] = value
}
</script>
```

#### **Templates** (Page Layouts)
- Wire organisms together
- Define page structure
- No business logic
- Example: `FormLayout`

```vue
<!-- components/templates/FormLayout.vue -->
<template>
  <div class="form-layout">
    <Header />
    
    <main class="form-container">
      <slot name="form-header" />
      <slot name="form-content" />
      <slot name="form-footer" />
    </main>
    
    <Footer />
  </div>
</template>
```

#### **Pages** (Specific Instances)
- Use templates with real content
- Fetch and manage data
- Handle routing
- Example: `pages/forms/[id].vue`

```vue
<!-- pages/forms/[id].vue -->
<template>
  <FormLayout>
    <template #form-header>
      <h1>{{ formSchema?.name }}</h1>
      <ProgressBar :progress="progress" />
    </template>
    
    <template #form-content>
      <FormSection
        v-for="section in formSchema?.sections"
        :key="section.id"
        v-bind="section"
      />
    </template>
    
    <template #form-footer>
      <Button @click="generatePDF">Generate PDF</Button>
    </template>
  </FormLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const formId = route.params.id

const { data: formSchema } = await useFetch(`/api/forms/${formId}/schema`)
const progress = computed(() => calculateProgress())

async function generatePDF() {
  // Implementation
}
</script>
```

## Component Checklist

When creating components, ensure:

- [ ] **Single Responsibility**: Each component does one thing well
- [ ] **Reusability**: Can be used in multiple contexts
- [ ] **Props Over Slots** (for atoms/molecules): Prefer props for configuration
- [ ] **Composables for Logic**: Extract business logic to composables
- [ ] **TypeScript**: Fully typed props and emits
- [ ] **Accessibility**: ARIA labels, keyboard navigation, focus management
- [ ] **Tailwind Classes**: Use utility classes, avoid custom CSS
- [ ] **Documentation**: Add JSDoc comments for props

## Naming Conventions

- **Components**: PascalCase (`FormField.vue`, `Button.vue`)
- **Composables**: camelCase with `use` prefix (`useFormData.ts`)
- **Props**: camelCase
- **Events**: kebab-case (`@update-value`)
- **CSS Classes**: kebab-case (Tailwind utilities)

## File Organization

```
refinery-formready/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── composables/
│   ├── useFormData.ts
│   ├── useApi.ts
│   └── useValidation.ts
├── pages/
│   ├── index.vue
│   └── forms/
│       └── [id].vue
├── types/
│   ├── form.ts
│   └── api.ts
├── utils/
│   ├── validation.ts
│   └── formatting.ts
└── assets/
    └── css/
        └── main.css
```

## API Integration

Use composables to interact with the backend:

```ts
// composables/useFormData.ts
export function useFormData(formId: string) {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl
  
  const { data: schema, error } = await useFetch(
    `${apiUrl}/forms/${formId}/schema`
  )
  
  const generatePDF = async (formData: any) => {
    return await $fetch(`${apiUrl}/forms/${formId}/generate`, {
      method: 'POST',
      body: formData
    })
  }
  
  return { schema, generatePDF, error }
}
```

## State Management

Use Pinia for global state (only when needed):

```ts
// stores/form.ts
export const useFormStore = defineStore('form', () => {
  const formData = ref<Record<string, any>>({})
  const currentStep = ref(0)
  
  function updateField(id: string, value: any) {
    formData.value[id] = value
  }
  
  return { formData, currentStep, updateField }
})
```

## Development Workflow

1. **Design First**: Identify atoms, molecules, organisms needed
2. **Build Atoms**: Create reusable building blocks
3. **Compose Molecules**: Combine atoms into functional units
4. **Assemble Organisms**: Build complex sections
5. **Create Templates**: Define page layouts
6. **Wire Pages**: Connect templates with real data

## Testing Strategy

- **Atoms**: Test props, events, rendering
- **Molecules**: Test interactions between atoms
- **Organisms**: Test data fetching, state management
- **Pages**: End-to-end testing with Playwright

## Performance

- Use `v-show` vs `v-if` appropriately
- Lazy load pages with `defineAsyncComponent`
- Optimize images with Nuxt Image
- Minimize bundle size with code splitting

---

**Remember**: Start small (atoms) and compose up. Keep components focused, reusable, and well-documented!
