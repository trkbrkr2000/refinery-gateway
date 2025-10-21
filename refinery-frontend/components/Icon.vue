<template>
  <svg 
    :class="className"
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Menu icon -->
    <path 
      v-if="name === 'menu'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M4 6h16M4 12h16M4 18h16"
    />
    
    <!-- Home icon -->
    <path 
      v-else-if="name === 'home'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
    
    <!-- Workflow icon -->
    <path 
      v-else-if="name === 'workflow'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
    
    <!-- Puzzle (Components) icon -->
    <path 
      v-else-if="name === 'puzzle'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
    />
    
    <!-- Play (Executions) icon -->
    <path 
      v-else-if="name === 'play'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-9v3m0 0V5a2 2 0 012-2h4a2 2 0 012 2v3m-6 0h6m-5 4v3a2 2 0 002 2h4a2 2 0 002-2v-3"
    />
    
    <!-- Settings icon -->
    <path 
      v-else-if="name === 'settings'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    
    <!-- Bell (Notifications) icon -->
    <path 
      v-else-if="name === 'bell'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
    
    <!-- User icon -->
    <path 
      v-else-if="name === 'user'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
    
    <!-- Logout icon -->
    <path 
      v-else-if="name === 'logout'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
    
    <!-- Chevron Right icon -->
    <path 
      v-else-if="name === 'chevron-right'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M9 5l7 7-7 7"
    />
    
    <!-- Chevron Left icon -->
    <path 
      v-else-if="name === 'chevron-left'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M15 19l-7-7 7-7"
    />
    
    <!-- Chevron Down icon -->
    <path 
      v-else-if="name === 'chevron-down'"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M19 9l-7 7-7-7"
    />
    
    <!-- Refinery logo icon (custom) -->
    <g v-else-if="name === 'refinery'">
      <circle cx="12" cy="12" r="3" stroke-width="2"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 1v6m0 10v6m11-7h-6m-10 0H1m15.5-6.5l-4.24 4.24M7.76 7.76L3.52 3.52m12.96 12.96l-4.24-4.24M7.76 16.24l-4.24 4.24"/>
    </g>
    
    <!-- Default fallback -->
    <circle v-else cx="12" cy="12" r="3" stroke-width="2"/>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  className: 'h-6 w-6'
});
</script>