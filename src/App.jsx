import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import clsx from 'clsx'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bot,
  Box,
  Braces,
  Check,
  ChevronDown,
  Columns3,
  Copy,
  Eye,
  FilePlus,
  GripVertical,
  Image,
  LayoutGrid,
  LayoutTemplate,
  Monitor,
  MousePointer2,
  Paintbrush,
  PanelLeft,
  PanelRight,
  Plus,
  Redo2,
  Save,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Type,
  Upload,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

const STORAGE_KEY = 'ai-elementor-react-editor-v1'
const devices = { desktop: 1120, tablet: 760, mobile: 390 }
const uid = (prefix = 'node') => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

const baseTheme = {
  colors: {
    primary: '#2563eb',
    secondary: '#0f172a',
    accent: '#f59e0b',
    text: '#172033',
    background: '#ffffff',
  },
  typography: {
    heading: 'Inter',
    body: 'Inter',
    button: 'Inter',
  },
  spacing: {
    small: '12px',
    medium: '24px',
    large: '48px',
  },
}

const widgetRegistry = {
  section: {
    name: 'Section',
    category: 'Layout',
    icon: Box,
    container: true,
    allowedParents: ['root'],
    allowedChildren: ['container', 'flex', 'grid', 'heading', 'paragraph', 'button', 'image', 'card', 'form', 'dropdown'],
    defaultProps: { name: 'Section' },
    defaultStyles: { padding: '72px 32px', background: '#ffffff', minHeight: '160px' },
    settings: ['background', 'padding', 'margin', 'radius', 'shadow'],
  },
  container: {
    name: 'Container',
    category: 'Layout',
    icon: Box,
    container: true,
    allowedParents: ['root', 'section', 'container', 'flex', 'grid', 'card'],
    allowedChildren: ['container', 'flex', 'grid', 'heading', 'paragraph', 'button', 'image', 'card', 'form', 'divider', 'spacer', 'dropdown'],
    defaultProps: { name: 'Container' },
    defaultStyles: { maxWidth: '1040px', margin: '0 auto', padding: '24px', gap: '20px', minHeight: '96px' },
    settings: ['padding', 'margin', 'gap', 'direction', 'align', 'justify', 'background', 'radius', 'shadow'],
  },
  flex: {
    name: 'Flex Container',
    category: 'Layout',
    icon: Columns3,
    container: true,
    allowedParents: ['root', 'section', 'container', 'flex', 'grid', 'card'],
    allowedChildren: ['container', 'grid', 'heading', 'paragraph', 'button', 'image', 'card', 'form', 'divider', 'spacer', 'dropdown'],
    defaultProps: { name: 'Flex Container' },
    defaultStyles: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '24px', padding: '16px', minHeight: '96px' },
    responsiveStyles: { mobile: { flexDirection: 'column', alignItems: 'stretch' } },
    settings: ['direction', 'align', 'justify', 'gap', 'padding', 'background', 'radius'],
  },
  grid: {
    name: 'Grid',
    category: 'Layout',
    icon: LayoutGrid,
    container: true,
    allowedParents: ['root', 'section', 'container', 'flex', 'card'],
    allowedChildren: ['container', 'heading', 'paragraph', 'button', 'image', 'card', 'form', 'dropdown'],
    defaultProps: { name: 'Grid', columns: 3 },
    defaultStyles: { display: 'grid', gap: '24px', minHeight: '96px' },
    responsiveStyles: { desktop: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }, tablet: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }, mobile: { gridTemplateColumns: '1fr' } },
    settings: ['columns', 'gap', 'padding', 'background'],
  },
  header: {
    name: 'Header',
    category: 'Navigation',
    icon: LayoutTemplate,
    container: true,
    allowedParents: ['root'],
    allowedChildren: ['container', 'flex', 'heading', 'paragraph', 'button', 'dropdown'],
    defaultProps: { name: 'Header' },
    defaultStyles: { padding: '18px 32px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'relative' },
    settings: ['background', 'padding', 'shadow'],
  },
  footer: {
    name: 'Footer',
    category: 'Navigation',
    icon: LayoutTemplate,
    container: true,
    allowedParents: ['root'],
    allowedChildren: ['container', 'flex', 'grid', 'heading', 'paragraph', 'button', 'dropdown'],
    defaultProps: { name: 'Footer' },
    defaultStyles: { padding: '42px 32px', background: '#0f172a', color: '#ffffff' },
    settings: ['background', 'padding', 'margin'],
  },
  dropdown: {
    name: 'Dropdown Menu',
    category: 'Navigation',
    icon: ChevronDown,
    allowedParents: ['header', 'footer', 'section', 'container', 'flex', 'grid', 'card'],
    defaultProps: { text: 'Dropdown Menu', links: 'Link 1\nLink 2\nLink 3', name: 'Dropdown Menu' },
    defaultStyles: { display: 'inline-block', background: '#059669', color: '#ffffff', padding: '12px 18px', borderRadius: '8px', fontWeight: '700' },
    settings: ['text', 'links', 'background', 'color', 'padding', 'radius'],
  },
  heading: {
    name: 'Heading',
    category: 'Basic',
    icon: Type,
    allowedParents: ['root', 'section', 'container', 'flex', 'grid', 'card'],
    defaultProps: { text: 'Your professional headline', tag: 'h2', name: 'Heading' },
    defaultStyles: { color: 'var(--theme-text)', fontSize: '48px', fontWeight: '800', lineHeight: '1.05', textAlign: 'left' },
    responsiveStyles: { tablet: { fontSize: '40px' }, mobile: { fontSize: '32px', textAlign: 'center' } },
    settings: ['text', 'tag', 'fontSize', 'weight', 'color', 'align', 'margin'],
  },
  paragraph: {
    name: 'Paragraph',
    category: 'Basic',
    icon: Type,
    allowedParents: ['root', 'section', 'container', 'flex', 'grid', 'card'],
    defaultProps: { text: 'Add clear supporting copy that helps visitors understand your offer.', name: 'Paragraph' },
    defaultStyles: { color: '#475569', fontSize: '18px', lineHeight: '1.7', textAlign: 'left' },
    responsiveStyles: { mobile: { fontSize: '16px', textAlign: 'center' } },
    settings: ['text', 'fontSize', 'color', 'align', 'margin'],
  },
  button: {
    name: 'Button',
    category: 'Basic',
    icon: MousePointer2,
    allowedParents: ['root', 'section', 'container', 'flex', 'grid', 'card', 'form'],
    defaultProps: { text: 'Get Started', url: '#', name: 'Button' },
    defaultStyles: { display: 'inline-flex', width: 'fit-content', background: 'var(--theme-primary)', color: '#ffffff', padding: '14px 22px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' },
    settings: ['text', 'url', 'background', 'color', 'padding', 'radius', 'fontSize', 'margin'],
  },
  image: {
    name: 'Image',
    category: 'Media',
    icon: Image,
    allowedParents: ['root', 'section', 'container', 'flex', 'grid', 'card'],
    defaultProps: { src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80', alt: 'Modern workspace', name: 'Image' },
    defaultStyles: { width: '100%', maxWidth: '520px', height: '320px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 18px 35px rgba(15, 23, 42, .18)' },
    settings: ['src', 'alt', 'width', 'height', 'radius', 'shadow', 'margin'],
  },
  divider: {
    name: 'Divider',
    category: 'Basic',
    icon: Braces,
    allowedParents: ['section', 'container', 'flex', 'grid', 'card'],
    defaultProps: { name: 'Divider' },
    defaultStyles: { height: '1px', background: '#e2e8f0', width: '100%' },
    settings: ['background', 'height', 'margin'],
  },
  spacer: {
    name: 'Spacer',
    category: 'Basic',
    icon: Braces,
    allowedParents: ['section', 'container', 'flex', 'grid', 'card'],
    defaultProps: { name: 'Spacer' },
    defaultStyles: { height: '32px' },
    settings: ['height'],
  },
  card: {
    name: 'Card',
    category: 'Content',
    icon: Box,
    container: true,
    allowedParents: ['section', 'container', 'flex', 'grid'],
    allowedChildren: ['heading', 'paragraph', 'button', 'image', 'divider', 'spacer', 'dropdown'],
    defaultProps: { name: 'Card' },
    defaultStyles: { background: '#ffffff', padding: '28px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15, 23, 42, .08)' },
    settings: ['background', 'padding', 'radius', 'shadow', 'margin'],
  },
  form: {
    name: 'Form',
    category: 'Forms',
    icon: Braces,
    container: true,
    allowedParents: ['section', 'container', 'flex', 'grid', 'card'],
    allowedChildren: ['input', 'textarea', 'button'],
    defaultProps: { name: 'Contact Form' },
    defaultStyles: { display: 'grid', gap: '14px', padding: '24px', background: '#f8fafc', borderRadius: '8px' },
    settings: ['gap', 'padding', 'background', 'radius'],
  },
  input: {
    name: 'Input',
    category: 'Forms',
    icon: Braces,
    allowedParents: ['form'],
    defaultProps: { placeholder: 'Your name', name: 'Input' },
    defaultStyles: { padding: '14px', border: '1px solid #cbd5e1', borderRadius: '8px' },
    settings: ['placeholder', 'padding', 'radius'],
  },
  textarea: {
    name: 'Textarea',
    category: 'Forms',
    icon: Braces,
    allowedParents: ['form'],
    defaultProps: { placeholder: 'How can we help?', name: 'Textarea' },
    defaultStyles: { padding: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', minHeight: '120px' },
    settings: ['placeholder', 'padding', 'radius'],
  },
}

const widgetAliases = [
  ['Hero', 'Marketing', Sparkles, 'quick:hero'],
  ['Hotel Hero', 'Marketing', Sparkles, 'quick:hotelHero'],
  ['Features', 'Marketing', LayoutTemplate, 'quick:features'],
  ['Rooms', 'Content', LayoutTemplate, 'quick:rooms'],
  ['Dining', 'Content', LayoutTemplate, 'quick:dining'],
  ['Amenities', 'Content', LayoutTemplate, 'quick:amenities'],
  ['Gallery', 'Media', LayoutTemplate, 'quick:gallery'],
  ['Booking', 'Forms', LayoutTemplate, 'quick:booking'],
  ['Pricing', 'Marketing', LayoutTemplate, 'quick:pricing'],
  ['CTA', 'Marketing', Sparkles, 'quick:cta'],
  ['Testimonials', 'Content', LayoutTemplate, 'quick:testimonials'],
  ['Team', 'Content', LayoutTemplate, 'quick:team'],
  ['FAQ', 'Content', LayoutTemplate, 'quick:faq'],
  ['Contact', 'Forms', LayoutTemplate, 'quick:contact'],
  ['Navbar', 'Navigation', LayoutTemplate, 'quick:header'],
  ['Footer', 'Navigation', LayoutTemplate, 'quick:footer'],
]

function makeNode(type, overrides = {}, children = []) {
  const widget = widgetRegistry[type]
  return {
    id: overrides.id || uid(type),
    type,
    props: { ...widget.defaultProps, ...(overrides.props || {}) },
    styles: { ...widget.defaultStyles, ...(overrides.styles || {}) },
    responsiveStyles: { ...(widget.responsiveStyles || {}), ...(overrides.responsiveStyles || {}) },
    children,
    hidden: false,
    locked: false,
  }
}

function cloneNode(node) {
  return {
    ...node,
    id: uid(node.type),
    props: { ...node.props, name: `${node.props.name || widgetRegistry[node.type].name} Copy` },
    styles: { ...node.styles },
    responsiveStyles: structuredClone(node.responsiveStyles || {}),
    children: (node.children || []).map(cloneNode),
  }
}

function headerSection() {
  return makeNode('header', { props: { name: 'Header' } }, [
    makeNode('flex', { props: { name: 'Navigation Bar' }, styles: { maxWidth: '1120px', margin: '0 auto', padding: '0', gap: '22px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' } }, [
      makeNode('heading', { props: { text: 'StudioCraft', tag: 'h3', name: 'Logo' }, styles: { fontSize: '26px', color: 'var(--theme-secondary)', margin: '0' } }),
      makeNode('paragraph', { props: { text: 'Home   About   Services   Contact', name: 'Menu' }, styles: { fontSize: '15px', color: '#475569', textAlign: 'center', margin: '0 auto', whiteSpace: 'nowrap' } }),
      makeNode('dropdown', { props: { text: 'Pages', links: 'Home\nAbout\nServices\nContact' }, styles: { background: '#f8fafc', color: '#172033', border: '1px solid #e2e8f0', padding: '10px 14px' } }),
      makeNode('button', { props: { text: 'Start Project', name: 'Header Button' }, styles: { padding: '10px 16px', borderRadius: '999px' } }),
    ]),
  ])
}

function heroSection(title = 'Build a website that feels professionally designed') {
  return makeNode('section', { props: { name: 'Hero' }, styles: { padding: '64px 32px', background: '#f8fafc' } }, [
    makeNode('grid', { props: { name: 'Hero Layout' }, styles: { maxWidth: '1120px', margin: '0 auto', padding: '0', gap: '40px', alignItems: 'center' }, responsiveStyles: { desktop: { gridTemplateColumns: '1.05fr .95fr' }, tablet: { gridTemplateColumns: '1fr' }, mobile: { gridTemplateColumns: '1fr' } } }, [
      makeNode('container', { props: { name: 'Hero Copy' }, styles: { padding: '0', maxWidth: '560px', margin: '0', display: 'grid', gap: '18px' } }, [
        makeNode('heading', { props: { text: title, name: 'Hero Heading' }, styles: { fontSize: '44px', maxWidth: '560px' } }),
        makeNode('paragraph', { props: { text: 'Drag sections, edit text inline, tune spacing visually, and let AI make structured changes to the page.' } }),
        makeNode('button', { props: { text: 'Create My Site' } }),
      ]),
      makeNode('image', { props: { alt: 'Website builder preview' }, styles: { width: '100%', maxWidth: '460px', height: '300px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 18px 35px rgba(15, 23, 42, .18)' } }),
    ]),
  ])
}

function cardsSection(name = 'Features', heading = 'Everything you need to launch', labels = ['Visual Editing', 'Responsive Layouts', 'AI Operations']) {
  return makeNode('section', { props: { name }, styles: { padding: '76px 32px', background: '#ffffff' } }, [
    makeNode('container', { props: { name: `${name} Intro` }, styles: { maxWidth: '1120px', padding: '0', display: 'grid', gap: '28px' } }, [
      makeNode('heading', { props: { text: heading }, styles: { fontSize: '42px', textAlign: 'center' } }),
      makeNode('grid', { props: { name: `${name} Grid`, columns: 3 } }, labels.map((label) =>
        makeNode('card', { props: { name: `${label} Card` } }, [
          makeNode('heading', { props: { text: label, tag: 'h3' }, styles: { fontSize: '24px' } }),
          makeNode('paragraph', { props: { text: 'Edit this card, duplicate it, move it, or save it as a reusable component.' } }),
        ]),
      )),
    ]),
  ])
}

function ctaSection() {
  return makeNode('section', { props: { name: 'CTA' }, styles: { padding: '76px 32px', background: '#172033' } }, [
    makeNode('container', { props: { name: 'CTA Content' }, styles: { maxWidth: '840px', textAlign: 'center', display: 'grid', gap: '20px' } }, [
      makeNode('heading', { props: { text: 'Ready to publish something polished?' }, styles: { color: '#ffffff', textAlign: 'center', fontSize: '42px' } }),
      makeNode('paragraph', { props: { text: 'Preview the site, adjust each device, and keep every element editable.' }, styles: { color: '#cbd5e1', textAlign: 'center' } }),
      makeNode('button', { props: { text: 'Get Started Today' }, styles: { margin: '0 auto', background: '#f59e0b' } }),
    ]),
  ])
}

function footerSection() {
  return makeNode('footer', {}, [
    makeNode('grid', { props: { name: 'Footer Layout' }, styles: { maxWidth: '1120px', margin: '0 auto', gap: '28px' }, responsiveStyles: { desktop: { gridTemplateColumns: '2fr 1fr 1fr' }, tablet: { gridTemplateColumns: '1fr 1fr' }, mobile: { gridTemplateColumns: '1fr' } } }, [
      makeNode('container', { props: { name: 'Footer Brand' }, styles: { padding: '0', display: 'grid', gap: '12px' } }, [
        makeNode('heading', { props: { text: 'StudioCraft', tag: 'h3' }, styles: { color: '#ffffff', fontSize: '24px' } }),
        makeNode('paragraph', { props: { text: 'Build and edit professional websites visually.' }, styles: { color: '#cbd5e1', fontSize: '15px' } }),
      ]),
      makeNode('paragraph', { props: { text: 'Home\nAbout\nServices\nContact', name: 'Footer Links' }, styles: { color: '#cbd5e1', whiteSpace: 'pre-line' } }),
      makeNode('paragraph', { props: { text: '© 2026 StudioCraft', name: 'Copyright' }, styles: { color: '#cbd5e1', fontSize: '14px' } }),
    ]),
  ])
}

function contactSection() {
  return makeNode('section', { props: { name: 'Contact' }, styles: { padding: '76px 32px', background: '#ffffff' } }, [
    makeNode('grid', { props: { name: 'Contact Layout' }, styles: { maxWidth: '1120px', margin: '0 auto', gap: '32px' }, responsiveStyles: { desktop: { gridTemplateColumns: '1fr 1fr' }, tablet: { gridTemplateColumns: '1fr' }, mobile: { gridTemplateColumns: '1fr' } } }, [
      makeNode('container', { props: { name: 'Contact Details' } }, [
        makeNode('heading', { props: { text: 'Tell us about your project' }, styles: { fontSize: '40px' } }),
        makeNode('paragraph', { props: { text: 'Email hello@example.com or use the form. Every field is editable in the schema.' } }),
      ]),
      makeNode('form', {}, [
        makeNode('input', { props: { placeholder: 'Your name' } }),
        makeNode('input', { props: { placeholder: 'Email address' } }),
        makeNode('textarea', { props: { placeholder: 'Project details' } }),
        makeNode('button', { props: { text: 'Send Message' } }),
      ]),
    ]),
  ])
}

function hotelHeader() {
  return makeNode('header', { props: { name: 'Hotel Header' }, styles: { padding: '18px 32px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' } }, [
    makeNode('flex', { props: { name: 'Hotel Navigation' }, styles: { maxWidth: '1180px', margin: '0 auto', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' } }, [
      makeNode('heading', { props: { text: 'Azure Table & Stay', tag: 'h3', name: 'Brand' }, styles: { fontSize: '24px', margin: '0', color: '#132238' } }),
      makeNode('paragraph', { props: { text: 'Rooms   Dining   Events   Contact', name: 'Menu' }, styles: { fontSize: '15px', color: '#475569', margin: '0 auto', whiteSpace: 'nowrap' } }),
      makeNode('button', { props: { text: 'Reserve Now', name: 'Reserve Button' }, styles: { background: '#b45309', borderRadius: '999px', padding: '11px 18px' } }),
    ]),
  ])
}

function hotelHero() {
  return makeNode('section', { props: { name: 'Hotel Hero' }, styles: { padding: '82px 32px', background: '#fff7ed' } }, [
    makeNode('grid', { props: { name: 'Hero Grid' }, styles: { maxWidth: '1180px', margin: '0 auto', gap: '44px', alignItems: 'center' }, responsiveStyles: { desktop: { gridTemplateColumns: '1fr 1fr' }, tablet: { gridTemplateColumns: '1fr' }, mobile: { gridTemplateColumns: '1fr' } } }, [
      makeNode('container', { props: { name: 'Hero Copy' }, styles: { padding: '0', display: 'grid', gap: '18px' } }, [
        makeNode('paragraph', { props: { text: 'Restaurant + Boutique Hotel' }, styles: { color: '#b45309', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' } }),
        makeNode('heading', { props: { text: 'A warm stay with unforgettable dining', tag: 'h1' }, styles: { fontSize: '54px', color: '#132238', lineHeight: '1.02' }, responsiveStyles: { tablet: { fontSize: '42px' }, mobile: { fontSize: '34px', textAlign: 'center' } } }),
        makeNode('paragraph', { props: { text: 'Create a refined hotel website with rooms, dining, booking, amenities, and contact sections. Every element stays editable.' }, styles: { fontSize: '18px', color: '#475569' } }),
        makeNode('button', { props: { text: 'Book a Table or Room' }, styles: { background: '#b45309', borderRadius: '999px', padding: '15px 24px' } }),
      ]),
      makeNode('image', { props: { src: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1100&q=80', alt: 'Boutique hotel lounge' }, styles: { width: '100%', maxWidth: '540px', height: '380px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 20px 45px rgba(15, 23, 42, .18)' } }),
    ]),
  ])
}

function roomsSection() {
  return cardsSection('Rooms', 'Stay in comfort', ['Deluxe Room', 'Garden Suite', 'Family Stay'])
}

function diningSection() {
  return cardsSection('Dining', 'Signature menu highlights', ['Seasonal Breakfast', 'Chef Dinner', 'Private Dining'])
}

function amenitiesSection() {
  return cardsSection('Amenities', 'Everything for a relaxed visit', ['Spa Access', 'Event Hall', 'Concierge'])
}

function gallerySection() {
  return makeNode('section', { props: { name: 'Gallery' }, styles: { padding: '72px 32px', background: '#f8fafc' } }, [
    makeNode('container', { props: { name: 'Gallery Container' }, styles: { maxWidth: '1180px', padding: '0', display: 'grid', gap: '28px' } }, [
      makeNode('heading', { props: { text: 'A closer look inside', tag: 'h2' }, styles: { fontSize: '42px', textAlign: 'center' } }),
      makeNode('grid', { props: { name: 'Gallery Grid' }, responsiveStyles: { desktop: { gridTemplateColumns: 'repeat(3, 1fr)' }, tablet: { gridTemplateColumns: 'repeat(2, 1fr)' }, mobile: { gridTemplateColumns: '1fr' } } }, [
        makeNode('image', { props: { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', alt: 'Hotel exterior' }, styles: { height: '240px', maxWidth: '100%' } }),
        makeNode('image', { props: { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80', alt: 'Restaurant table' }, styles: { height: '240px', maxWidth: '100%' } }),
        makeNode('image', { props: { src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80', alt: 'Guest room' }, styles: { height: '240px', maxWidth: '100%' } }),
      ]),
    ]),
  ])
}

function bookingSection() {
  return makeNode('section', { props: { name: 'Booking' }, styles: { padding: '76px 32px', background: '#ffffff' } }, [
    makeNode('grid', { props: { name: 'Booking Layout' }, styles: { maxWidth: '1120px', margin: '0 auto', gap: '32px' }, responsiveStyles: { desktop: { gridTemplateColumns: '1fr 1fr' }, tablet: { gridTemplateColumns: '1fr' }, mobile: { gridTemplateColumns: '1fr' } } }, [
      makeNode('container', { props: { name: 'Booking Copy' }, styles: { display: 'grid', gap: '16px' } }, [
        makeNode('heading', { props: { text: 'Reserve your table or room', tag: 'h2' }, styles: { fontSize: '40px' } }),
        makeNode('paragraph', { props: { text: 'Use this editable booking section for restaurant reservations, room inquiries, events, and private dining.' } }),
      ]),
      makeNode('form', {}, [
        makeNode('input', { props: { placeholder: 'Full name' } }),
        makeNode('input', { props: { placeholder: 'Email or phone' } }),
        makeNode('input', { props: { placeholder: 'Date and time' } }),
        makeNode('textarea', { props: { placeholder: 'Room, table, or event details' } }),
        makeNode('button', { props: { text: 'Send Reservation Request' }, styles: { background: '#b45309' } }),
      ]),
    ]),
  ])
}

function hotelFooter() {
  return makeNode('footer', { styles: { background: '#132238', padding: '46px 32px', color: '#ffffff' } }, [
    makeNode('grid', { props: { name: 'Hotel Footer Layout' }, styles: { maxWidth: '1180px', margin: '0 auto', gap: '28px' }, responsiveStyles: { desktop: { gridTemplateColumns: '2fr 1fr 1fr' }, tablet: { gridTemplateColumns: '1fr 1fr' }, mobile: { gridTemplateColumns: '1fr' } } }, [
      makeNode('container', { props: { name: 'Footer Brand' }, styles: { padding: '0', display: 'grid', gap: '12px' } }, [
        makeNode('heading', { props: { text: 'Azure Table & Stay', tag: 'h3' }, styles: { color: '#ffffff', fontSize: '24px' } }),
        makeNode('paragraph', { props: { text: 'Restaurant, rooms, events, and warm hospitality in one editable website.' }, styles: { color: '#cbd5e1' } }),
      ]),
      makeNode('paragraph', { props: { text: 'Rooms\nDining\nEvents\nReservations' }, styles: { color: '#cbd5e1', whiteSpace: 'pre-line' } }),
      makeNode('paragraph', { props: { text: 'hello@example.com\n+1 555 0188\nOpen daily' }, styles: { color: '#cbd5e1', whiteSpace: 'pre-line' } }),
    ]),
  ])
}

function quickSection(kind) {
  const sections = {
    header: headerSection,
    hero: () => heroSection('Create a beautiful website without writing code'),
    hotelHeader,
    hotelHero,
    rooms: roomsSection,
    dining: diningSection,
    amenities: amenitiesSection,
    gallery: gallerySection,
    booking: bookingSection,
    features: () => cardsSection('Features', 'Features your visitors will notice'),
    services: () => cardsSection('Services', 'Services built around your goals', ['Strategy', 'Design', 'Growth']),
    pricing: () => cardsSection('Pricing', 'Simple packages for every stage', ['Starter', 'Growth', 'Scale']),
    testimonials: () => cardsSection('Testimonials', 'Clients trust the process', ['Helpful', 'Fast', 'Professional']),
    team: () => cardsSection('Team', 'Meet the team', ['Founder', 'Designer', 'Developer']),
    faq: () => cardsSection('FAQ', 'Common questions answered', ['How long?', 'What is included?', 'Can I edit it?']),
    cta: ctaSection,
    contact: contactSection,
    footer: footerSection,
    hotelFooter,
  }
  return sections[kind]?.() || heroSection()
}

function hotelPageNodes(pageName = 'Home') {
  const pages = {
    Home: [hotelHeader(), hotelHero(), roomsSection(), diningSection(), amenitiesSection(), gallerySection(), bookingSection(), hotelFooter()],
    Rooms: [hotelHeader(), heroSection('Rooms designed for comfort'), roomsSection(), amenitiesSection(), bookingSection(), hotelFooter()],
    Dining: [hotelHeader(), heroSection('Seasonal dining and private tables'), diningSection(), gallerySection(), bookingSection(), hotelFooter()],
    Events: [hotelHeader(), heroSection('Host memorable events with ease'), cardsSection('Events', 'Spaces for every gathering', ['Weddings', 'Private Dining', 'Corporate Events']), bookingSection(), hotelFooter()],
    Contact: [hotelHeader(), heroSection('Plan your visit'), bookingSection(), contactSection(), hotelFooter()],
  }
  return pages[pageName] || [hotelHeader(), heroSection(`Build ${pageName}`), bookingSection(), hotelFooter()]
}

function hotelWebsite() {
  const pages = ['Home', 'Rooms', 'Dining', 'Events', 'Contact'].map((name) => makePage(name, hotelPageNodes(name)))
  return {
    id: uid('site'),
    schemaVersion: 5,
    name: 'Azure Table & Stay',
    homePageId: pages[0].id,
    globalStyles: {
      ...baseTheme,
      colors: { primary: '#b45309', secondary: '#132238', accent: '#f59e0b', text: '#132238', background: '#ffffff' },
    },
    reusableComponents: [],
    pages,
    preferences: { mode: 'simple' },
  }
}

function makePage(name, nodes = []) {
  return { id: uid('page'), name, slug: name.toLowerCase().replace(/\s+/g, '-'), settings: {}, nodes }
}

function defaultWebsite() {
  return {
    id: uid('site'),
    schemaVersion: 5,
    name: 'My Website',
    homePageId: null,
    globalStyles: baseTheme,
    reusableComponents: [],
    pages: [
      makePage('Home', [headerSection(), heroSection(), cardsSection(), ctaSection(), footerSection()]),
      makePage('About', [headerSection(), heroSection('A small team helping brands move faster'), cardsSection('Team', 'People behind the work', ['Strategy Lead', 'Designer', 'Builder']), ctaSection(), footerSection()]),
      makePage('Services', [headerSection(), heroSection('Services for modern digital teams'), cardsSection('Services', 'What we can build together', ['Web Design', 'Automation', 'SEO']), ctaSection(), footerSection()]),
      makePage('Contact', [headerSection(), heroSection('Let us start a useful conversation'), contactSection(), footerSection()]),
    ],
    preferences: { mode: 'simple' },
  }
}

function findNode(nodes, id, parentId = 'root') {
  for (const node of nodes) {
    if (node.id === id) return { node, parentId }
    const found = findNode(node.children || [], id, node.id)
    if (found) return found
  }
  return null
}

function findNodeLocation(nodes, id, parentId = 'root') {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]
    if (node.id === id) return { node, parentId, index }
    const found = findNodeLocation(node.children || [], id, node.id)
    if (found) return found
  }
  return null
}

function mapNodes(nodes, id, updater) {
  return nodes.map((node) => {
    if (node.id === id) return updater(node)
    return { ...node, children: mapNodes(node.children || [], id, updater) }
  })
}

function removeNode(nodes, id) {
  let removed = null
  const next = nodes
    .filter((node) => {
      if (node.id === id) {
        removed = node
        return false
      }
      return true
    })
    .map((node) => {
      const result = removeNode(node.children || [], id)
      if (result.removed) removed = result.removed
      return { ...node, children: result.nodes }
    })
  return { nodes: next, removed }
}

function insertNode(nodes, parentId, node, index = null) {
  if (parentId === 'root') {
    const next = [...nodes]
    next.splice(index ?? next.length, 0, node)
    return next
  }
  return nodes.map((item) => {
    if (item.id === parentId) {
      const children = [...(item.children || [])]
      children.splice(index ?? children.length, 0, node)
      return { ...item, children }
    }
    return { ...item, children: insertNode(item.children || [], parentId, node, index) }
  })
}

function getCurrentPage(website, pageId) {
  return website.pages.find((page) => page.id === pageId) || website.pages[0]
}

function canDrop(nodes, parentId, type) {
  if (parentId === 'root') return widgetRegistry[type].allowedParents.includes('root')
  const parent = findNode(nodes, parentId)?.node
  return Boolean(parent && widgetRegistry[type].allowedParents.includes(parent.type) && widgetRegistry[parent.type].allowedChildren?.includes(type))
}

function applyToPage(website, pageId, mapper) {
  return { ...website, pages: website.pages.map((page) => (page.id === pageId ? mapper(page) : page)) }
}

function historyWrap(reducer) {
  return (state, action) => {
    if (action.type === 'UNDO') {
      const previous = state.history.past.at(-1)
      if (!previous) return state
      return { ...state, website: previous, history: { past: state.history.past.slice(0, -1), future: [state.website, ...state.history.future] }, saved: 'Unsaved changes' }
    }
    if (action.type === 'REDO') {
      const next = state.history.future[0]
      if (!next) return state
      return { ...state, website: next, history: { past: [...state.history.past, state.website], future: state.history.future.slice(1) }, saved: 'Unsaved changes' }
    }
    const next = reducer(state, action)
    if (next.website !== state.website && !action.skipHistory) {
      return { ...next, history: { past: [...state.history.past.slice(-49), state.website], future: [] }, saved: 'Unsaved changes' }
    }
    return next
  }
}

function editorReducer(state, action) {
  const page = getCurrentPage(state.website, state.currentPageId)
  switch (action.type) {
    case 'SET_DEVICE':
      return { ...state, device: action.device }
    case 'TOGGLE_PREVIEW':
      return { ...state, preview: !state.preview }
    case 'SET_PANEL':
      return { ...state, leftPanel: action.panel }
    case 'SET_RIGHT_PANEL':
      return { ...state, rightPanel: action.panel }
    case 'SELECT':
      return { ...state, selectedId: action.id, rightPanel: action.id ? 'settings' : state.rightPanel }
    case 'SAVE':
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.website))
      return { ...state, saved: 'Saved', lastSavedAt: new Date().toLocaleTimeString(), history: state.history }
    case 'RENAME_SITE':
      return { ...state, website: { ...state.website, name: action.name } }
    case 'ADD_PAGE': {
      const pageName = action.name || 'New Page'
      const nodes = action.template === 'Hotel' ? hotelPageNodes(pageName) : [headerSection(), heroSection('Start building this page'), footerSection()]
      const nextPage = makePage(pageName, nodes)
      return { ...state, currentPageId: nextPage.id, selectedId: null, website: { ...state.website, pages: [...state.website.pages, nextPage], preferences: { ...state.website.preferences, currentPageId: nextPage.id } } }
    }
    case 'OPEN_PAGE':
      return { ...state, currentPageId: action.id, selectedId: null, website: { ...state.website, preferences: { ...state.website.preferences, currentPageId: action.id } } }
    case 'RENAME_PAGE':
      return { ...state, website: { ...state.website, pages: state.website.pages.map((p) => (p.id === action.id ? { ...p, name: action.name, slug: action.name.toLowerCase().replace(/\s+/g, '-') } : p)) } }
    case 'DUPLICATE_PAGE': {
      const original = state.website.pages.find((p) => p.id === action.id)
      const copy = { ...structuredClone(original), id: uid('page'), name: `${original.name} Copy`, slug: `${original.slug}-copy` }
      return { ...state, currentPageId: copy.id, website: { ...state.website, pages: [...state.website.pages, copy] } }
    }
    case 'DELETE_PAGE': {
      if (state.website.pages.length === 1) return state
      const pages = state.website.pages.filter((p) => p.id !== action.id)
      return { ...state, currentPageId: pages[0].id, selectedId: null, website: { ...state.website, pages } }
    }
    case 'SET_HOME':
      return { ...state, website: { ...state.website, homePageId: action.id } }
    case 'ADD_NODE': {
      const node = action.node || makeNode(action.widgetType)
      const parentId = action.parentId || 'root'
      if (!canDrop(page.nodes, parentId, node.type)) return { ...state, notice: 'Cannot place this element here.' }
      return {
        ...state,
        selectedId: node.id,
        notice: `${widgetRegistry[node.type].name} added`,
        website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: insertNode(p.nodes, parentId, node, action.index) })),
      }
    }
    case 'ADD_BLANK_AFTER': {
      const location = findNodeLocation(page.nodes, action.id)
      if (!location) return state
      if (action.node) {
        const targetParentId = canDrop(page.nodes, location.parentId, action.node.type) ? location.parentId : 'root'
        const targetIndex = targetParentId === location.parentId ? location.index + 1 : null
        return {
          ...state,
          selectedId: action.node.id,
          notice: `${widgetRegistry[action.node.type].name} added`,
          website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: insertNode(p.nodes, targetParentId, action.node, targetIndex) })),
        }
      }
      const requestedType = action.widgetType || (location.parentId === 'root' ? 'section' : 'container')
      const newNodeType = location.parentId === 'root' && !widgetRegistry[requestedType].allowedParents.includes('root') ? 'section' : requestedType
      if (!canDrop(page.nodes, location.parentId, newNodeType)) return { ...state, notice: 'Cannot add a blank block here.' }
      const blankNode = makeNode(newNodeType, {
        props: { name: `Blank ${widgetRegistry[newNodeType].name}` },
        styles: {
          ...(newNodeType === 'section'
            ? { padding: '48px 32px', background: '#ffffff', minHeight: '220px' }
            : { padding: '24px', background: '#ffffff', minHeight: '160px', border: '1px dashed #bfdbfe' }),
          ...(action.styles || {}),
        },
      })
      return {
        ...state,
        selectedId: blankNode.id,
        notice: `${widgetRegistry[blankNode.type].name} added`,
        website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: insertNode(p.nodes, location.parentId, blankNode, location.index + 1) })),
      }
    }
    case 'MOVE_NODE': {
      if (action.id === action.parentId) return state
      const moving = findNode(page.nodes, action.id)?.node
      if (!moving || !canDrop(page.nodes, action.parentId, moving.type)) return { ...state, notice: 'Cannot place this element here.' }
      const without = removeNode(page.nodes, action.id).nodes
      return { ...state, website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: insertNode(without, action.parentId, moving, action.index) })) }
    }
    case 'DELETE_NODE':
      return { ...state, selectedId: null, website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: removeNode(p.nodes, action.id).nodes })) }
    case 'DUPLICATE_NODE': {
      const found = findNode(page.nodes, action.id)
      if (!found) return state
      return { ...state, selectedId: null, website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: insertNode(p.nodes, found.parentId, cloneNode(found.node)) })) }
    }
    case 'UPDATE_NODE':
      return { ...state, website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: mapNodes(p.nodes, action.id, (node) => ({ ...node, props: { ...node.props, ...(action.props || {}) }, styles: { ...node.styles, ...(action.styles || {}) }, responsiveStyles: { ...node.responsiveStyles, ...(action.responsiveStyles || {}) } })) })) }
    case 'FILL_CONTAINER':
      return { ...state, website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: mapNodes(p.nodes, action.id, (node) => ({ ...node, children: action.children })) })) }
    case 'TOGGLE_NODE':
      return { ...state, website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: mapNodes(p.nodes, action.id, (node) => ({ ...node, [action.field]: !node[action.field] })) })) }
    case 'COPY_STYLE': {
      const found = findNode(page.nodes, action.id)?.node
      return { ...state, copiedStyle: found ? { type: found.type, styles: found.styles } : null, notice: 'Style copied' }
    }
    case 'PASTE_STYLE':
      if (!state.copiedStyle || !state.selectedId) return state
      return editorReducer(state, { type: 'UPDATE_NODE', id: state.selectedId, styles: state.copiedStyle.styles })
    case 'APPLY_STYLE_ALL':
      if (!state.copiedStyle) return state
      return { ...state, website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: updateAllOfType(p.nodes, state.copiedStyle.type, state.copiedStyle.styles) })) }
    case 'UPDATE_ALL_OF_TYPE':
      return { ...state, website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: updateAllOfType(p.nodes, action.widgetType, action.styles) })) }
    case 'SAVE_COMPONENT': {
      const found = findNode(page.nodes, action.id)?.node
      if (!found) return state
      return { ...state, website: { ...state.website, reusableComponents: [...state.website.reusableComponents, { id: uid('component'), name: found.props.name || widgetRegistry[found.type].name, node: structuredClone(found) }] }, notice: 'Reusable component saved' }
    }
    case 'UPDATE_GLOBAL':
      return { ...state, website: { ...state.website, globalStyles: { ...state.website.globalStyles, [action.group]: { ...state.website.globalStyles[action.group], [action.key]: action.value } } } }
    case 'LOAD_TEMPLATE':
      return { ...state, website: applyToPage(state.website, page.id, (p) => ({ ...p, nodes: templateNodes(action.template) })), selectedId: null }
    case 'LOAD_WEBSITE_TEMPLATE': {
      const website = action.template === 'Restaurant Hotel' ? hotelWebsite() : state.website
      return { ...state, website: { ...website, preferences: { ...website.preferences, currentPageId: website.pages[0].id } }, currentPageId: website.pages[0].id, selectedId: null }
    }
    case 'IMPORT_NODES':
      return {
        ...state,
        selectedId: null,
        website: applyToPage(state.website, page.id, (p) => ({
          ...p,
          settings: { ...p.settings, importedCss: action.css || '' },
          nodes: action.nodes.length ? action.nodes : p.nodes,
        })),
      }
    default:
      return state
  }
}

function updateAllOfType(nodes, type, styles) {
  return nodes.map((node) => ({ ...node, styles: node.type === type ? { ...node.styles, ...styles } : node.styles, children: updateAllOfType(node.children || [], type, styles) }))
}

function templateNodes(template) {
  if (template === 'Restaurant Hotel') return hotelPageNodes('Home')
  if (template === 'Restaurant') return [headerSection(), heroSection('Fresh flavors, memorable evenings'), cardsSection('Menu Highlights', 'Popular dishes', ['Seasonal Plates', 'Private Dining', 'Catering']), contactSection(), footerSection()]
  if (template === 'Portfolio') return [headerSection(), heroSection('Designer portfolio for standout work'), cardsSection('Selected Work', 'Projects with purpose', ['Brand System', 'Web Experience', 'Product UI']), ctaSection(), footerSection()]
  return [headerSection(), heroSection(`Modern ${template} website`), cardsSection('Features', 'Built for conversion'), cardsSection('Pricing', 'Choose your package', ['Launch', 'Grow', 'Scale']), ctaSection(), footerSection()]
}

function layoutChildren(kind) {
  if (kind === 'content') {
    return [
      makeNode('heading', { props: { text: 'Add your section title here' }, styles: { fontSize: '36px' } }),
      makeNode('paragraph', { props: { text: 'Write a short, clear message for visitors. Click this text and edit it directly.' } }),
      makeNode('button', { props: { text: 'Call to Action' } }),
    ]
  }
  if (kind === 'imageText') {
    return [
      makeNode('grid', { props: { name: 'Image and Content' }, styles: { display: 'grid', gap: '32px', alignItems: 'center' }, responsiveStyles: { desktop: { gridTemplateColumns: '1fr 1fr' }, tablet: { gridTemplateColumns: '1fr' }, mobile: { gridTemplateColumns: '1fr' } } }, [
        makeNode('image', {}),
        makeNode('container', { props: { name: 'Content' }, styles: { padding: '0', display: 'grid', gap: '16px' } }, [
          makeNode('heading', { props: { text: 'Image left, content right' }, styles: { fontSize: '34px' } }),
          makeNode('paragraph', { props: { text: 'Use this layout for about sections, services, product highlights, or case studies.' } }),
          makeNode('button', { props: { text: 'Learn More' } }),
        ]),
      ]),
    ]
  }
  if (kind === 'cards') {
    return [
      makeNode('heading', { props: { text: 'Three useful cards' }, styles: { textAlign: 'center', fontSize: '36px' } }),
      makeNode('grid', { props: { name: 'Three Cards' } }, ['Card One', 'Card Two', 'Card Three'].map((title) =>
        makeNode('card', {}, [
          makeNode('heading', { props: { text: title, tag: 'h3' }, styles: { fontSize: '22px' } }),
          makeNode('paragraph', { props: { text: 'Describe this item in simple words.' } }),
        ]),
      )),
    ]
  }
  if (kind === 'contact') {
    return contactSection().children[0].children
  }
  return layoutChildren('content')
}

function htmlToSchema(html) {
  if (!html.trim() || typeof DOMParser === 'undefined') return []
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const roots = [...doc.body.children]
  return roots.map(domToNode).filter(Boolean)
}

function splitImportedSource(source) {
  const cssParts = []
  const html = source.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
    cssParts.push(css.trim())
    return ''
  })
  return { html, css: cssParts.join('\n\n') }
}

function domToNode(element) {
  const tag = element.tagName.toLowerCase()
  const text = element.textContent?.trim() || ''
  const inlineStyles = parseInlineStyle(element.getAttribute('style') || '')
  if (tag === 'header' || tag === 'nav') return makeNode('header', { props: { name: 'Imported Header' }, styles: { ...widgetRegistry.header.defaultStyles, ...inlineStyles } }, domChildren(element))
  if (tag === 'footer') return makeNode('footer', { props: { name: 'Imported Footer' }, styles: { ...widgetRegistry.footer.defaultStyles, ...inlineStyles } }, domChildren(element))
  if (['section', 'main', 'article'].includes(tag)) return makeNode('section', { props: { name: titleFromText(text, 'Imported Section') }, styles: { ...inlineStyles } }, domChildren(element))
  if (['div', 'aside'].includes(tag)) return makeNode('container', { props: { name: titleFromText(text, 'Imported Container') }, styles: { ...inlineStyles } }, domChildren(element))
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) return makeNode('heading', { props: { text: text || 'Imported Heading', tag, name: 'Imported Heading' }, styles: { ...inlineStyles } })
  if (tag === 'p' || tag === 'span') return makeNode('paragraph', { props: { text: text || 'Imported text', name: 'Imported Text' }, styles: { ...inlineStyles } })
  if (tag === 'a' || tag === 'button') return makeNode('button', { props: { text: text || 'Imported Button', url: element.getAttribute('href') || '#', name: 'Imported Button' }, styles: { ...inlineStyles } })
  if (tag === 'img') return makeNode('image', { props: { src: element.getAttribute('src') || widgetRegistry.image.defaultProps.src, alt: element.getAttribute('alt') || 'Imported image', name: 'Imported Image' }, styles: { ...inlineStyles } })
  if (tag === 'ul' || tag === 'ol') return makeNode('container', { props: { name: 'Imported List' }, styles: { display: 'grid', gap: '10px', ...inlineStyles } }, [...element.children].map((item) => makeNode('paragraph', { props: { text: item.textContent.trim(), name: 'List Item' } })))
  if (tag === 'input') return makeNode('input', { props: { placeholder: element.getAttribute('placeholder') || 'Imported input' }, styles: { ...inlineStyles } })
  if (tag === 'textarea') return makeNode('textarea', { props: { placeholder: element.getAttribute('placeholder') || 'Imported textarea' }, styles: { ...inlineStyles } })
  return text ? makeNode('paragraph', { props: { text, name: 'Imported Text' }, styles: { ...inlineStyles } }) : null
}

function domChildren(element) {
  const children = [...element.children].map(domToNode).filter(Boolean)
  if (children.length) return children
  const text = element.textContent?.trim()
  return text ? [makeNode('paragraph', { props: { text } })] : []
}

function parseInlineStyle(style) {
  return style.split(';').reduce((acc, rule) => {
    const [rawKey, rawValue] = rule.split(':')
    if (!rawKey || !rawValue) return acc
    const key = rawKey.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    acc[key] = rawValue.trim()
    return acc
  }, {})
}

function titleFromText(text, fallback) {
  return text ? text.slice(0, 28) : fallback
}

const reduce = historyWrap(editorReducer)

function initialState() {
  const loaded = localStorage.getItem(STORAGE_KEY)
  const parsed = loaded ? JSON.parse(loaded) : null
  const website = parsed?.schemaVersion >= 5 ? parsed : defaultWebsite()
  if (!website.homePageId) website.homePageId = website.pages[0].id
  const currentPageId = website.preferences?.currentPageId && website.pages.some((page) => page.id === website.preferences.currentPageId) ? website.preferences.currentPageId : website.pages[0].id
  return {
    website,
    currentPageId,
    selectedId: null,
    device: 'desktop',
    preview: false,
    leftPanel: 'widgets',
    rightPanel: 'settings',
    copiedStyle: null,
    notice: 'Ready',
    saved: loaded ? 'Saved' : 'Unsaved changes',
    history: { past: [], future: [] },
  }
}

function App() {
  const [state, dispatch] = useReducer(reduce, null, initialState)
  const [commandOpen, setCommandOpen] = useState(false)
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [leftWidth, setLeftWidth] = useState(340)
  const [rightWidth, setRightWidth] = useState(340)
  const [zoom, setZoom] = useState('fit')
  const page = getCurrentPage(state.website, state.currentPageId)
  const selected = state.selectedId ? findNode(page.nodes, state.selectedId)?.node : null

  const startResize = (side, event) => {
    event.preventDefault()
    const onMove = (moveEvent) => {
      if (side === 'left') setLeftWidth(Math.min(500, Math.max(280, moveEvent.clientX)))
      if (side === 'right') setRightWidth(Math.min(520, Math.max(300, window.innerWidth - moveEvent.clientX)))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  useEffect(() => {
    const onKey = (event) => {
      const meta = event.ctrlKey || event.metaKey
      if (meta && event.key.toLowerCase() === 's') { event.preventDefault(); dispatch({ type: 'SAVE', skipHistory: true }) }
      if (meta && event.key.toLowerCase() === 'z') { event.preventDefault(); dispatch({ type: 'UNDO' }) }
      if (meta && event.key.toLowerCase() === 'y') { event.preventDefault(); dispatch({ type: 'REDO' }) }
      if (meta && event.key.toLowerCase() === 'd' && state.selectedId) { event.preventDefault(); dispatch({ type: 'DUPLICATE_NODE', id: state.selectedId }) }
      if (meta && event.key.toLowerCase() === 'c' && state.selectedId) dispatch({ type: 'COPY_STYLE', id: state.selectedId, skipHistory: true })
      if (meta && event.key.toLowerCase() === 'v') { event.preventDefault(); dispatch({ type: 'PASTE_STYLE' }) }
      if (meta && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(true) }
      if (event.key === 'Delete' && state.selectedId) dispatch({ type: 'DELETE_NODE', id: state.selectedId })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.selectedId])

  useEffect(() => {
    const timer = setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(state.website)), 500)
    return () => clearTimeout(timer)
  }, [state.website])

  if (state.preview) {
    return <Preview state={state} page={page} dispatch={dispatch} />
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-900">
      <Toolbar
        state={state}
        dispatch={dispatch}
        onCommand={() => setCommandOpen(true)}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        setLeftOpen={setLeftOpen}
        setRightOpen={setRightOpen}
        zoom={zoom}
        setZoom={setZoom}
      />
      <div
        className="grid h-[calc(100vh-64px)]"
        style={{ gridTemplateColumns: `${leftOpen ? leftWidth : 0}px minmax(480px,1fr) ${rightOpen ? rightWidth : 0}px` }}
      >
        <div className={clsx('relative min-w-0 overflow-hidden', !leftOpen && 'border-r border-slate-200 bg-white')}>
          {leftOpen && <LeftSidebar state={state} dispatch={dispatch} />}
          {leftOpen && <ResizeHandle side="left" onMouseDown={(event) => startResize('left', event)} />}
        </div>
        <main className="min-w-0 overflow-hidden bg-white">
          <Canvas state={state} page={page} dispatch={dispatch} zoom={zoom} />
        </main>
        <div className={clsx('relative min-w-0 overflow-hidden', !rightOpen && 'border-l border-slate-200 bg-white')}>
          {rightOpen && <RightPanel state={state} dispatch={dispatch} selected={selected} page={page} />}
          {rightOpen && <ResizeHandle side="right" onMouseDown={(event) => startResize('right', event)} />}
        </div>
      </div>
      {commandOpen && <CommandPalette dispatch={dispatch} close={() => setCommandOpen(false)} />}
    </div>
  )
}

function Toolbar({ state, dispatch, onCommand, leftOpen, rightOpen, setLeftOpen, setRightOpen, zoom, setZoom }) {
  const zoomValue = zoom === 'fit' ? 'Fit' : `${Math.round(zoom * 100)}%`
  const updateZoom = (direction) => {
    const current = zoom === 'fit' ? 0.75 : zoom
    setZoom(Math.min(1.2, Math.max(0.35, current + direction)))
  }
  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white"><LayoutTemplate size={20} /></div>
        <input className="w-44 rounded-md border border-transparent px-2 py-1 text-sm font-bold hover:border-slate-200" value={state.website.name} onChange={(event) => dispatch({ type: 'RENAME_SITE', name: event.target.value })} aria-label="Website name" />
        <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{state.saved}{state.lastSavedAt ? ` at ${state.lastSavedAt}` : ''}</span>
      </div>
      <div className="flex items-center gap-1">
        <IconButton title="Show or hide left panel" active={leftOpen} onClick={() => setLeftOpen(!leftOpen)}><PanelLeft size={17} /></IconButton>
        <IconButton title="Show or hide right panel" active={rightOpen} onClick={() => setRightOpen(!rightOpen)}><PanelRight size={17} /></IconButton>
        <IconButton title="Undo" onClick={() => dispatch({ type: 'UNDO' })}><Undo2 size={17} /></IconButton>
        <IconButton title="Redo" onClick={() => dispatch({ type: 'REDO' })}><Redo2 size={17} /></IconButton>
        {['desktop', 'tablet', 'mobile'].map((device) => (
          <IconButton key={device} title={device} active={state.device === device} onClick={() => dispatch({ type: 'SET_DEVICE', device })}>
            {device === 'desktop' ? <Monitor size={17} /> : device === 'tablet' ? <Tablet size={17} /> : <Smartphone size={17} />}
          </IconButton>
        ))}
        <IconButton title="Zoom out" onClick={() => updateZoom(-0.1)}><ZoomOut size={17} /></IconButton>
        <button className={clsx('h-9 rounded-md border px-3 text-sm font-bold', zoom === 'fit' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600')} onClick={() => setZoom(zoom === 'fit' ? 1 : 'fit')}>{zoomValue}</button>
        <IconButton title="Zoom in" onClick={() => updateZoom(0.1)}><ZoomIn size={17} /></IconButton>
        <IconButton title="Command palette" onClick={onCommand}><Search size={17} /></IconButton>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50" onClick={() => dispatch({ type: 'TOGGLE_PREVIEW', skipHistory: true })}><Eye size={16} /> Preview</button>
        <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => dispatch({ type: 'SAVE', skipHistory: true })}><Save size={16} /> Save</button>
        <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500">Publish</button>
      </div>
    </div>
  )
}

function ResizeHandle({ side, onMouseDown }) {
  return (
    <div
      title="Drag to resize panel"
      className={clsx('absolute top-0 z-40 h-full w-2 cursor-col-resize bg-transparent hover:bg-blue-200', side === 'left' ? 'right-0' : 'left-0')}
      onMouseDown={onMouseDown}
    />
  )
}

function IconButton({ children, title, active, onClick }) {
  return <button title={title} className={clsx('inline-flex h-9 w-9 items-center justify-center rounded-md border text-slate-600 hover:bg-slate-50', active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent')} onClick={onClick}>{children}</button>
}

function LeftSidebar({ state, dispatch }) {
  const tabs = [['pages', PanelLeft], ['widgets', Plus], ['sections', LayoutTemplate], ['templates', Sparkles], ['components', Copy], ['styles', Paintbrush], ['import', Upload]]
  return (
    <aside className="editor-scrollbar h-full overflow-y-auto border-r border-slate-200 bg-white">
      <div className="sticky top-0 z-30 grid grid-cols-3 gap-2 border-b border-slate-200 bg-white p-3 shadow-sm">
        {tabs.map(([tab, Icon]) => <button key={tab} title={tab} className={clsx('min-w-0 rounded-md p-2 text-[11px] font-bold capitalize text-slate-600 hover:bg-slate-50', state.leftPanel === tab && 'bg-blue-50 text-blue-700')} onClick={() => dispatch({ type: 'SET_PANEL', panel: tab, skipHistory: true })}><Icon size={16} className="mx-auto mb-1" /><span className="block truncate">{tab}</span></button>)}
      </div>
      {state.leftPanel === 'pages' && <PagesPanel state={state} dispatch={dispatch} />}
      {state.leftPanel === 'widgets' && <WidgetPanel />}
      {state.leftPanel === 'sections' && <QuickSections />}
      {state.leftPanel === 'templates' && <TemplatesPanel dispatch={dispatch} />}
      {state.leftPanel === 'components' && <ComponentsPanel state={state} dispatch={dispatch} />}
      {state.leftPanel === 'styles' && <GlobalStyles state={state} dispatch={dispatch} />}
      {state.leftPanel === 'import' && <ImportPanel dispatch={dispatch} />}
    </aside>
  )
}

function PagesPanel({ state, dispatch }) {
  const [name, setName] = useState('')
  return (
    <Panel title="Pages">
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="mb-2 text-sm font-bold text-blue-950">Add a new page</div>
        <div className="flex gap-2">
          <input className="min-w-0 flex-1 rounded-md border border-blue-200 px-3 py-2 text-sm" placeholder="Page name, e.g. Gallery" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white" onClick={() => { dispatch({ type: 'ADD_PAGE', name: name || 'New Page' }); setName('') }}><FilePlus size={16} /> Add</button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {['Rooms', 'Dining', 'Events', 'Contact'].map((pageName) => (
            <button key={pageName} className="rounded-md border border-blue-200 bg-white px-2 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100" onClick={() => dispatch({ type: 'ADD_PAGE', name: pageName, template: 'Hotel' })}>{pageName} Page</button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {state.website.pages.map((page, index) => (
          <div key={page.id} className={clsx('rounded-md border p-3', page.id === state.currentPageId ? 'border-blue-400 bg-blue-50' : 'border-slate-200')}>
            <div className="flex items-center gap-2">
              <GripVertical size={14} className="text-slate-400" />
              <input className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm font-bold hover:border-slate-200" value={page.name} onChange={(e) => dispatch({ type: 'RENAME_PAGE', id: page.id, name: e.target.value })} />
              {state.website.homePageId === page.id && <span className="rounded bg-green-100 px-2 py-1 text-[11px] font-bold text-green-700">Home</span>}
              {page.id === state.currentPageId && <Check size={15} className="text-blue-600" />}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              <MiniButton onClick={() => dispatch({ type: 'OPEN_PAGE', id: page.id, skipHistory: true })}>Open</MiniButton>
              <MiniButton onClick={() => dispatch({ type: 'DUPLICATE_PAGE', id: page.id })}>Copy</MiniButton>
              <MiniButton onClick={() => dispatch({ type: 'SET_HOME', id: page.id })}>Set Home</MiniButton>
              <MiniButton onClick={() => dispatch({ type: 'DELETE_PAGE', id: page.id })} disabled={index === 0 && state.website.pages.length === 1}>Delete</MiniButton>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function WidgetPanel() {
  const [query, setQuery] = useState('')
  const widgets = Object.entries(widgetRegistry).filter(([, w]) => `${w.name} ${w.category}`.toLowerCase().includes(query.toLowerCase()))
  const grouped = widgets.reduce((acc, item) => ({ ...acc, [item[1].category]: [...(acc[item[1].category] || []), item] }), {})
  return (
    <Panel title="Widgets">
      <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Layout Blocks</h3>
        <div className="grid grid-cols-2 gap-2">
          {['section', 'container', 'flex', 'grid', 'header', 'footer', 'dropdown'].map((type) => {
            const widget = widgetRegistry[type]
            return <DraggableTile key={type} label={widget.name} icon={widget.icon} payload={{ type: 'widget', widgetType: type }} />
          })}
        </div>
      </div>
      <div className="relative mb-3"><Search size={15} className="absolute left-3 top-2.5 text-slate-400" /><input className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm" placeholder="Search widgets" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{category}</h3>
          <div className="grid grid-cols-2 gap-2">
            {items.map(([type, widget]) => <DraggableTile key={type} label={widget.name} icon={widget.icon} payload={{ type: 'widget', widgetType: type }} />)}
          </div>
        </div>
      ))}
    </Panel>
  )
}

function ImportPanel({ dispatch }) {
  const [source, setSource] = useState('')
  const importNow = () => {
    const { html, css } = splitImportedSource(source)
    const nodes = htmlToSchema(html)
    dispatch({ type: 'IMPORT_NODES', nodes, css })
  }
  const readFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setSource(String(reader.result || ''))
    reader.readAsText(file)
  }
  return (
    <Panel title="Import Website">
      <div className="space-y-3">
        <label className="block rounded-md border border-dashed border-slate-300 p-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          Upload one HTML file
          <input className="mt-2 block w-full text-xs" type="file" accept=".html,.htm,.txt" onChange={readFile} />
        </label>
        <textarea className="h-64 w-full rounded-md border border-slate-200 p-3 text-sm" placeholder="<style>...</style><header>...</header>" value={source} onChange={(e) => setSource(e.target.value)} />
        <button className="w-full rounded-md bg-blue-600 px-3 py-3 text-sm font-bold text-white hover:bg-blue-700" onClick={importNow}>Convert to Editable Page</button>
      </div>
    </Panel>
  )
}

function QuickSections() {
  return <Panel title="Quick Sections"><div className="grid grid-cols-2 gap-2">{widgetAliases.map(([label, , Icon, payload]) => <DraggableTile key={label} label={label} icon={Icon} payload={{ type: 'quick', kind: payload.split(':')[1] }} />)}</div></Panel>
}

function TemplatesPanel({ dispatch }) {
  const templates = ['Restaurant Hotel', 'SaaS', 'Agency', 'Restaurant', 'Portfolio', 'Business', 'Blog', 'E-commerce', 'Landing Page']
  return (
    <Panel title="Templates">
      <button className="mb-3 w-full rounded-md bg-amber-700 p-3 text-left text-sm font-extrabold text-white hover:bg-amber-800" onClick={() => dispatch({ type: 'LOAD_WEBSITE_TEMPLATE', template: 'Restaurant Hotel' })}>Build Full Restaurant/Hotel Website</button>
      <div className="space-y-2">{templates.map((template) => <button key={template} className="w-full rounded-md border border-slate-200 p-3 text-left text-sm font-semibold hover:border-blue-400 hover:bg-blue-50" onClick={() => dispatch({ type: 'LOAD_TEMPLATE', template })}>{template}</button>)}</div>
    </Panel>
  )
}

function ComponentsPanel({ state }) {
  return (
    <Panel title="Reusable Components">
      {state.website.reusableComponents.length === 0 && <Empty text="Select an element and save it as a reusable component." />}
      <div className="space-y-2">{state.website.reusableComponents.map((item) => <DraggableTile key={item.id} label={item.name} icon={Copy} payload={{ type: 'component', componentId: item.id }} />)}</div>
    </Panel>
  )
}

function GlobalStyles({ state, dispatch }) {
  return <Panel title="Global Styles"><div className="space-y-4">{Object.entries(state.website.globalStyles.colors).map(([key, value]) => <Labeled key={key} label={key}><input type="color" value={value} onChange={(e) => dispatch({ type: 'UPDATE_GLOBAL', group: 'colors', key, value: e.target.value })} /></Labeled>)}</div></Panel>
}

function DraggableTile({ label, icon: Icon, payload }) {
  return <div draggable onDragStart={(e) => e.dataTransfer.setData('application/editor', JSON.stringify(payload))} className="flex cursor-grab items-center gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold hover:border-blue-400 hover:bg-blue-50"><Icon size={16} /> {label}</div>
}

function Canvas({ state, page, dispatch, zoom }) {
  const viewportRef = useRef(null)
  const pageRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(900)
  const [pageHeight, setPageHeight] = useState(900)
  const [panning, setPanning] = useState(null)
  const baseWidth = devices[state.device]
  const fitScale = Math.min(1.25, Math.max(0.35, viewportWidth / baseWidth))
  const scale = zoom === 'fit' ? fitScale : zoom
  const scaledWidth = baseWidth * scale

  useEffect(() => {
    const node = viewportRef.current
    if (!node) return undefined
    const update = () => setViewportWidth(node.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const node = pageRef.current
    if (!node) return undefined
    const update = () => setPageHeight(node.scrollHeight || node.offsetHeight || 900)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [page, state.device])

  const startPan = (event) => {
    if (!(event.button === 1 || event.altKey || event.code === 'Space')) return
    event.preventDefault()
    setPanning({ x: event.clientX, y: event.clientY, left: viewportRef.current.scrollLeft, top: viewportRef.current.scrollTop })
  }

  const movePan = (event) => {
    if (!panning) return
    viewportRef.current.scrollLeft = panning.left - (event.clientX - panning.x)
    viewportRef.current.scrollTop = panning.top - (event.clientY - panning.y)
  }

  return (
    <div
      ref={viewportRef}
      className={clsx('editor-scrollbar h-[calc(100vh-64px)] overflow-auto bg-white', panning && 'cursor-grabbing')}
      onMouseDown={startPan}
      onMouseMove={movePan}
      onMouseUp={() => setPanning(null)}
      onMouseLeave={() => setPanning(null)}
    >
      <div className="transition-all" style={{ width: scaledWidth, height: pageHeight * scale }}>
        <div
          className="origin-top-left overflow-visible"
          style={{ width: baseWidth, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <div
            ref={pageRef}
            className="min-h-[650px] overflow-hidden bg-white shadow-editor"
            style={{
              '--theme-primary': state.website.globalStyles.colors.primary,
              '--theme-secondary': state.website.globalStyles.colors.secondary,
              '--theme-text': state.website.globalStyles.colors.text,
              '--theme-background': state.website.globalStyles.colors.background,
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'root', state, dispatch)}
          >
            {page.settings?.importedCss && <style>{page.settings.importedCss}</style>}
            {page.nodes.length === 0 ? <EmptyDrop dispatch={dispatch} state={state} /> : page.nodes.map((node) => <RenderNode key={node.id} node={node} state={state} dispatch={dispatch} parentId="root" />)}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyDrop({ dispatch, state }) {
  return (
    <div className="m-8 flex min-h-[420px] items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 p-8 text-center" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'root', state, dispatch)}>
      <div>
        <div className="text-lg font-extrabold text-blue-950">Start your page</div>
        <div className="mt-2 text-sm font-semibold text-blue-700">Drag a section here or add a ready block.</div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {[
            ['Hero', 'hero'],
            ['Features', 'features'],
            ['Contact', 'contact'],
            ['Footer', 'footer'],
          ].map(([label, kind]) => (
            <button key={kind} className="rounded-md bg-white px-4 py-3 text-sm font-bold text-blue-800 shadow-sm hover:bg-blue-100" onClick={() => dispatch({ type: 'ADD_NODE', node: quickSection(kind), parentId: 'root' })}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function handleDrop(e, parentId, state, dispatch) {
  e.preventDefault()
  e.stopPropagation()
  const raw = e.dataTransfer.getData('application/editor')
  if (!raw) return
  const payload = JSON.parse(raw)
  if (payload.type === 'widget') dispatch({ type: 'ADD_NODE', widgetType: payload.widgetType, parentId })
  if (payload.type === 'quick') dispatch({ type: 'ADD_NODE', node: quickSection(payload.kind), parentId })
  if (payload.type === 'component') {
    const component = state.website.reusableComponents.find((item) => item.id === payload.componentId)
    if (component) dispatch({ type: 'ADD_NODE', node: cloneNode(component.node), parentId })
  }
  if (payload.type === 'move') dispatch({ type: 'MOVE_NODE', id: payload.id, parentId })
}

function RenderNode({ node, state, dispatch, parentId }) {
  if (node.hidden) return null
  const selected = state.selectedId === node.id
  const widget = widgetRegistry[node.type]
  const style = { ...node.styles, ...(node.responsiveStyles?.[state.device] || {}) }
  const common = {
    style,
    draggable: !node.locked,
    onDragStart: (e) => { e.stopPropagation(); e.dataTransfer.setData('application/editor', JSON.stringify({ type: 'move', id: node.id })) },
    onClick: (e) => { e.stopPropagation(); dispatch({ type: 'SELECT', id: node.id, skipHistory: true }) },
    className: clsx('relative transition outline-offset-[-2px]', selected ? 'outline outline-2 outline-blue-500' : 'hover:outline hover:outline-1 hover:outline-blue-300'),
  }
  const containerProps = widget.container ? {
    ...common,
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => handleDrop(e, node.id, state, dispatch),
  } : common
  return (
    <ElementShell node={node} selected={selected} dispatch={dispatch} parentId={parentId}>
      {node.type === 'heading' && <EditableTag tag={node.props.tag || 'h2'} node={node} common={common} dispatch={dispatch} prop="text" />}
      {node.type === 'paragraph' && <p {...common} contentEditable suppressContentEditableWarning onBlur={(e) => dispatch({ type: 'UPDATE_NODE', id: node.id, props: { text: e.currentTarget.textContent } })}>{node.props.text}</p>}
      {node.type === 'button' && <a {...common} href={node.props.url} contentEditable suppressContentEditableWarning onClick={(e) => { e.preventDefault(); common.onClick(e) }} onBlur={(e) => dispatch({ type: 'UPDATE_NODE', id: node.id, props: { text: e.currentTarget.textContent } })}>{node.props.text}</a>}
      {node.type === 'dropdown' && <DropdownNode node={node} common={common} dispatch={dispatch} />}
      {node.type === 'image' && <img {...common} src={node.props.src} alt={node.props.alt} />}
      {node.type === 'divider' && <div {...common} />}
      {node.type === 'spacer' && <div {...common} />}
      {node.type === 'input' && <input {...common} placeholder={node.props.placeholder} readOnly />}
      {node.type === 'textarea' && <textarea {...common} placeholder={node.props.placeholder} readOnly />}
      {widget.container && (
        <div {...containerProps}>
          {(node.children || []).map((child) => <RenderNode key={child.id} node={child} state={state} dispatch={dispatch} parentId={node.id} />)}
          {(node.children || []).length === 0 && <EmptyContainerDrop node={node} state={state} dispatch={dispatch} />}
        </div>
      )}
    </ElementShell>
  )
}

function EmptyContainerDrop({ node, state, dispatch }) {
  const quickItems = [
    ['Text Block', 'content'],
    ['Image + Text', 'imageText'],
    ['3 Cards', 'cards'],
    ['Contact', 'contact'],
  ]
  return (
    <div
      className="m-2 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/70 p-5 text-center"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => handleDrop(event, node.id, state, dispatch)}
    >
      <div className="text-sm font-bold text-blue-900">Blank area</div>
      <div className="mt-1 text-xs text-blue-700">Drag a widget here or choose a ready layout.</div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {quickItems.map(([label, kind]) => (
          <button
            key={kind}
            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100"
            onClick={(event) => {
              event.stopPropagation()
              dispatch({ type: 'FILL_CONTAINER', id: node.id, children: layoutChildren(kind) })
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function DropdownNode({ node, common, dispatch }) {
  const [open, setOpen] = useState(false)
  const links = String(node.props.links || '').split('\n').filter(Boolean)
  return (
    <div className="relative inline-block" onClick={(event) => event.stopPropagation()}>
      <button
        {...common}
        draggable={false}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          dispatch({ type: 'SELECT', id: node.id, skipHistory: true })
          setOpen(!open)
        }}
      >
        {node.props.text} <ChevronDown size={14} className="ml-2 inline-block" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 min-w-44 overflow-hidden rounded-md border border-slate-200 bg-white py-2 text-slate-800 shadow-editor">
          {links.map((link) => <button key={link} className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50">{link}</button>)}
        </div>
      )}
    </div>
  )
}

function EditableTag({ tag, node, common, dispatch, prop }) {
  const Tag = tag
  return <Tag {...common} contentEditable suppressContentEditableWarning onBlur={(e) => dispatch({ type: 'UPDATE_NODE', id: node.id, props: { [prop]: e.currentTarget.textContent } })}>{node.props[prop]}</Tag>
}

function ElementShell({ node, selected, dispatch, children }) {
  const [addOpen, setAddOpen] = useState(false)
  const addOptions = [
    ['Blank Section', { widgetType: 'section' }],
    ['Container', { widgetType: 'container' }],
    ['Grid', { widgetType: 'grid' }],
    ['Flex Horizontal', { widgetType: 'flex', styles: { flexDirection: 'row' } }],
    ['Flex Vertical', { widgetType: 'flex', styles: { flexDirection: 'column', alignItems: 'stretch' } }],
    ['Hotel Hero', { node: hotelHero() }],
    ['Rooms Section', { node: roomsSection() }],
    ['Dining Section', { node: diningSection() }],
    ['Gallery Section', { node: gallerySection() }],
    ['Booking Section', { node: bookingSection() }],
  ]
  return (
    <div className="group relative">
      {selected && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-md border border-blue-200 bg-white/95 px-2 py-1 text-xs font-bold text-blue-700 shadow">
          <span className="max-w-24 truncate">{widgetRegistry[node.type].name}</span>
          <button className="rounded p-1 hover:bg-blue-50" title="Duplicate" onClick={() => dispatch({ type: 'DUPLICATE_NODE', id: node.id })}><Copy size={13} /></button>
          <button className="rounded p-1 hover:bg-blue-50" title="Copy style" onClick={() => dispatch({ type: 'COPY_STYLE', id: node.id, skipHistory: true })}><Paintbrush size={13} /></button>
          <button className="rounded p-1 hover:bg-blue-50" title="Save component" onClick={() => dispatch({ type: 'SAVE_COMPONENT', id: node.id })}><Save size={13} /></button>
          <button className="rounded p-1 text-red-600 hover:bg-red-50" title="Delete" onClick={() => dispatch({ type: 'DELETE_NODE', id: node.id })}><Trash2 size={13} /></button>
        </div>
      )}
      {children}
      {selected && (
        <div className="absolute bottom-0 left-1/2 z-30 -translate-x-1/2 translate-y-1/2" onClick={(event) => event.stopPropagation()}>
          <button
            className="rounded-full border border-blue-200 bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow hover:bg-blue-700"
            title="Add a blank editable block below"
            onClick={() => setAddOpen(!addOpen)}
          >
            + Add
          </button>
          {addOpen && (
            <div className="absolute left-1/2 top-full mt-2 w-44 -translate-x-1/2 overflow-hidden rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-editor">
              {addOptions.map(([label, config]) => (
                <button
                  key={label}
                  className="block w-full px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => {
                    dispatch({ type: 'ADD_BLANK_AFTER', id: node.id, ...config })
                    setAddOpen(false)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RightPanel({ state, dispatch, selected, page }) {
  const tabs = [['settings', Settings], ['navigator', Braces], ['ai', Bot]]
  return (
    <aside className="editor-scrollbar h-full overflow-y-auto border-l border-slate-200 bg-white">
      <div className="flex border-b border-slate-200 p-2">{tabs.map(([tab, Icon]) => <button key={tab} className={clsx('flex-1 rounded-md p-2 capitalize', state.rightPanel === tab && 'bg-blue-50 text-blue-700')} onClick={() => dispatch({ type: 'SET_RIGHT_PANEL', panel: tab, skipHistory: true })}><Icon size={16} className="mx-auto" /></button>)}</div>
      {state.rightPanel === 'settings' && <SettingsPanel selected={selected} dispatch={dispatch} state={state} />}
      {state.rightPanel === 'navigator' && <Navigator page={page} dispatch={dispatch} selectedId={state.selectedId} />}
      {state.rightPanel === 'ai' && <AIPanel state={state} dispatch={dispatch} selected={selected} />}
    </aside>
  )
}

function SettingsPanel({ selected, dispatch, state }) {
  if (!selected) return <Panel title="Settings"><Empty text="Select an element to edit content, style, layout, and advanced options." /></Panel>
  const type = selected.type
  return (
    <Panel title={`${widgetRegistry[type].name} Settings`}>
      <SectionTitle>Content</SectionTitle>
      {['text', 'src', 'alt', 'placeholder', 'url'].map((key) => key in selected.props && <Labeled key={key} label={key === 'src' ? 'Image URL' : key}><input className="field w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={selected.props[key]} onChange={(e) => dispatch({ type: 'UPDATE_NODE', id: selected.id, props: { [key]: e.target.value } })} /></Labeled>)}
      {'links' in selected.props && <Labeled label="Dropdown Links"><textarea className="h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={selected.props.links} onChange={(e) => dispatch({ type: 'UPDATE_NODE', id: selected.id, props: { links: e.target.value } })} /></Labeled>}
      {'tag' in selected.props && <Labeled label="HTML Tag"><select className="field" value={selected.props.tag} onChange={(e) => dispatch({ type: 'UPDATE_NODE', id: selected.id, props: { tag: e.target.value } })}>{['h1', 'h2', 'h3', 'p'].map((t) => <option key={t}>{t}</option>)}</select></Labeled>}
      <SectionTitle>Style</SectionTitle>
      <StyleInput label="Text Size" value={selected.styles.fontSize} onChange={(v) => dispatch({ type: 'UPDATE_NODE', id: selected.id, styles: { fontSize: v } })} />
      <StyleInput label="Color" type="color" value={selected.styles.color} onChange={(v) => dispatch({ type: 'UPDATE_NODE', id: selected.id, styles: { color: v } })} />
      <StyleInput label="Background" type="color" value={selected.styles.background} onChange={(v) => dispatch({ type: 'UPDATE_NODE', id: selected.id, styles: { background: v } })} />
      <StyleInput label="Corner Roundness" value={selected.styles.borderRadius} onChange={(v) => dispatch({ type: 'UPDATE_NODE', id: selected.id, styles: { borderRadius: v } })} />
      <SpacingPresets selected={selected} dispatch={dispatch} />
      <StyleInput label="Inner Spacing" value={selected.styles.padding} onChange={(v) => dispatch({ type: 'UPDATE_NODE', id: selected.id, styles: { padding: v } })} />
      <StyleInput label="Outer Spacing" value={selected.styles.margin} onChange={(v) => dispatch({ type: 'UPDATE_NODE', id: selected.id, styles: { margin: v } })} />
      <StyleInput label="Space Between Items" value={selected.styles.gap} onChange={(v) => dispatch({ type: 'UPDATE_NODE', id: selected.id, styles: { gap: v } })} />
      <SectionTitle>Layout</SectionTitle>
      {widgetRegistry[type].container && <MagicLayout selected={selected} dispatch={dispatch} />}
      <Segment label="Alignment" value={selected.styles.textAlign || selected.styles.alignItems} options={[['left', 'Left', AlignLeft], ['center', 'Center', AlignCenter], ['right', 'Right', AlignRight]]} onChange={(v) => dispatch({ type: 'UPDATE_NODE', id: selected.id, styles: type === 'heading' || type === 'paragraph' ? { textAlign: v } : { alignItems: v === 'left' ? 'flex-start' : v === 'right' ? 'flex-end' : 'center' } })} />
      {widgetRegistry[type].container && <Segment label="Direction" value={selected.styles.flexDirection} options={[['row', 'Horizontal', Columns3], ['column', 'Vertical', PanelRight]]} onChange={(v) => dispatch({ type: 'UPDATE_NODE', id: selected.id, styles: { display: 'flex', flexDirection: v } })} />}
      {type === 'grid' && <Labeled label={`${state.device} Columns`}><input className="field" type="number" min="1" max="6" value={(selected.responsiveStyles?.[state.device]?.gridTemplateColumns || '').match(/repeat\((\d)/)?.[1] || selected.props.columns || 3} onChange={(e) => dispatch({ type: 'UPDATE_NODE', id: selected.id, responsiveStyles: { ...selected.responsiveStyles, [state.device]: { ...selected.responsiveStyles?.[state.device], gridTemplateColumns: `repeat(${e.target.value}, minmax(0, 1fr))` } } })} /></Labeled>}
      <SectionTitle>Advanced</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <MiniButton onClick={() => dispatch({ type: 'TOGGLE_NODE', id: selected.id, field: 'hidden' })}>Hide</MiniButton>
        <MiniButton onClick={() => dispatch({ type: 'TOGGLE_NODE', id: selected.id, field: 'locked' })}>Lock</MiniButton>
        <MiniButton onClick={() => dispatch({ type: 'PASTE_STYLE' })}>Paste Style</MiniButton>
        <MiniButton onClick={() => dispatch({ type: 'APPLY_STYLE_ALL' })}>Apply to All</MiniButton>
      </div>
    </Panel>
  )
}

function Navigator({ page, dispatch, selectedId }) {
  return <Panel title="Navigator"><h3 className="mb-3 text-sm font-bold">{page.name}</h3><div className="space-y-1">{page.nodes.map((node) => <TreeNode key={node.id} node={node} dispatch={dispatch} selectedId={selectedId} depth={0} />)}</div></Panel>
}

function SpacingPresets({ selected, dispatch }) {
  const presets = [
    ['Tight', { padding: '12px', margin: '0', gap: '12px' }],
    ['Normal', { padding: '24px', margin: '0', gap: '20px' }],
    ['Spacious', { padding: '40px', margin: '0', gap: '28px' }],
    ['Big Section', { padding: '72px 32px', margin: '0', gap: '36px' }],
  ]
  return (
    <Labeled label="Easy Spacing">
      <div className="grid grid-cols-2 gap-2">
        {presets.map(([label, styles]) => (
          <button
            key={label}
            className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold hover:border-blue-400 hover:bg-blue-50"
            onClick={() => dispatch({ type: 'UPDATE_NODE', id: selected.id, styles })}
          >
            {label}
          </button>
        ))}
      </div>
    </Labeled>
  )
}

function MagicLayout({ selected, dispatch }) {
  const layouts = [
    ['Text + Button', 'content'],
    ['Image + Text', 'imageText'],
    ['Three Cards', 'cards'],
    ['Contact Form', 'contact'],
  ]
  return (
    <Labeled label="Generate Layout">
      <div className="grid grid-cols-2 gap-2">
        {layouts.map(([label, kind]) => (
          <button
            key={kind}
            className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100"
            onClick={() => dispatch({ type: 'FILL_CONTAINER', id: selected.id, children: layoutChildren(kind) })}
          >
            {label}
          </button>
        ))}
      </div>
    </Labeled>
  )
}

function TreeNode({ node, dispatch, selectedId, depth }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <div className={clsx('flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100', selectedId === node.id && 'bg-blue-50 text-blue-700')} style={{ paddingLeft: 8 + depth * 14 }}>
        <button onClick={() => setOpen(!open)}><ChevronDown size={13} className={clsx(!open && '-rotate-90')} /></button>
        <button className="min-w-0 flex-1 truncate text-left" onClick={() => dispatch({ type: 'SELECT', id: node.id, skipHistory: true })}>{node.props.name || widgetRegistry[node.type].name}</button>
        <button onClick={() => dispatch({ type: 'DUPLICATE_NODE', id: node.id })}><Copy size={13} /></button>
        <button onClick={() => dispatch({ type: 'DELETE_NODE', id: node.id })}><Trash2 size={13} /></button>
      </div>
      {open && (node.children || []).map((child) => <TreeNode key={child.id} node={child} dispatch={dispatch} selectedId={selectedId} depth={depth + 1} />)}
    </div>
  )
}

function AIPanel({ state, dispatch, selected }) {
  const [prompt, setPrompt] = useState('')
  const [plan, setPlan] = useState(null)
  const operations = useMemo(() => plan || [], [plan])
  return (
    <Panel title="AI Assistant">
      <textarea className="h-24 w-full rounded-md border border-slate-200 p-3 text-sm" placeholder="What do you want to change?" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button className="mt-2 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white" onClick={() => setPlan(buildAiOperations(prompt, selected))}>Generate Operations</button>
      <div className="mt-3 space-y-2">
        {operations.length > 0 && <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">AI wants to make {operations.length} change{operations.length > 1 ? 's' : ''}.</div>}
        {operations.map((op, i) => <div key={i} className="rounded-md border border-slate-200 p-2 text-xs font-mono">{op.action}</div>)}
        {operations.length > 0 && <button className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-bold text-white" onClick={() => { applyAiOperations(operations, state, dispatch); setPlan(null); setPrompt('') }}>Apply Changes</button>}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2">
        {['Make this heading blue.', 'Make this button larger.', 'Add a three-column services section.', 'Make all buttons rounded.', 'Create a modern hero section.'].map((sample) => <button key={sample} className="rounded-md border border-slate-200 p-2 text-left text-xs hover:bg-slate-50" onClick={() => setPrompt(sample)}>{sample}</button>)}
      </div>
    </Panel>
  )
}

function buildAiOperations(prompt, selected) {
  const text = prompt.toLowerCase()
  if (text.includes('three-column services')) return [{ action: 'CREATE_SECTION', node: quickSection('services') }]
  if (text.includes('modern hero')) return [{ action: 'CREATE_SECTION', node: quickSection('hero') }]
  if (text.includes('all buttons') && text.includes('round')) return [{ action: 'UPDATE_ALL_OF_TYPE', type: 'button', styles: { borderRadius: '999px' } }]
  if (!selected) return [{ action: 'CREATE_SECTION', node: quickSection('hero') }]
  if (text.includes('blue')) return [{ action: 'UPDATE_STYLE', targetId: selected.id, styles: { color: '#2563eb' } }]
  if (text.includes('button') && (text.includes('larger') || text.includes('bigger'))) return [{ action: 'UPDATE_STYLE', targetId: selected.id, styles: { padding: '18px 30px', fontSize: '18px' } }]
  if (text.includes('image') && text.includes('right')) return [{ action: 'UPDATE_STYLE', targetId: selected.id, styles: { marginLeft: 'auto', marginRight: '0' } }]
  if (text.includes('mobile friendly')) return [{ action: 'UPDATE_RESPONSIVE_STYLE', targetId: selected.id, responsiveStyles: { mobile: { flexDirection: 'column', textAlign: 'center', gridTemplateColumns: '1fr' } } }]
  return [{ action: 'UPDATE_STYLE', targetId: selected.id, styles: { boxShadow: '0 18px 35px rgba(37, 99, 235, .18)' } }]
}

function applyAiOperations(ops, state, dispatch) {
  ops.forEach((op) => {
    if (op.action === 'CREATE_SECTION') dispatch({ type: 'ADD_NODE', node: op.node, parentId: 'root' })
    if (op.action === 'UPDATE_STYLE') dispatch({ type: 'UPDATE_NODE', id: op.targetId, styles: op.styles })
    if (op.action === 'UPDATE_RESPONSIVE_STYLE') dispatch({ type: 'UPDATE_NODE', id: op.targetId, responsiveStyles: { ...findNode(getCurrentPage(state.website, state.currentPageId).nodes, op.targetId)?.node.responsiveStyles, ...op.responsiveStyles } })
    if (op.action === 'UPDATE_ALL_OF_TYPE') dispatch({ type: 'UPDATE_ALL_OF_TYPE', widgetType: op.type, styles: op.styles })
  })
}

function Preview({ state, page, dispatch }) {
  return (
    <div className="min-h-screen bg-slate-200">
      <button className="fixed right-4 top-4 z-50 rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow" onClick={() => dispatch({ type: 'TOGGLE_PREVIEW', skipHistory: true })}>Back</button>
      <div className="mx-auto bg-white shadow-editor" style={{ width: devices[state.device], '--theme-primary': state.website.globalStyles.colors.primary, '--theme-secondary': state.website.globalStyles.colors.secondary, '--theme-text': state.website.globalStyles.colors.text }}>
        {page.settings?.importedCss && <style>{page.settings.importedCss}</style>}
        {page.nodes.map((node) => <RenderPreview key={node.id} node={node} device={state.device} />)}
      </div>
    </div>
  )
}

function RenderPreview({ node, device }) {
  if (node.hidden) return null
  const style = { ...node.styles, ...(node.responsiveStyles?.[device] || {}) }
  const children = (node.children || []).map((child) => <RenderPreview key={child.id} node={child} device={device} />)
  if (node.type === 'heading') { const Tag = node.props.tag || 'h2'; return <Tag style={style}>{node.props.text}</Tag> }
  if (node.type === 'paragraph') return <p style={style}>{node.props.text}</p>
  if (node.type === 'button') return <a style={style} href={node.props.url}>{node.props.text}</a>
  if (node.type === 'dropdown') return <div style={style}>{node.props.text}</div>
  if (node.type === 'image') return <img style={style} src={node.props.src} alt={node.props.alt} />
  if (node.type === 'input') return <input style={style} placeholder={node.props.placeholder} />
  if (node.type === 'textarea') return <textarea style={style} placeholder={node.props.placeholder} />
  return <div style={style}>{children}</div>
}

function CommandPalette({ dispatch, close }) {
  const commands = [
    ['Add Hero', () => dispatch({ type: 'ADD_NODE', node: quickSection('hero'), parentId: 'root' })],
    ['Add Button', () => dispatch({ type: 'ADD_NODE', widgetType: 'button', parentId: 'root' })],
    ['Add Grid', () => dispatch({ type: 'ADD_NODE', widgetType: 'grid', parentId: 'root' })],
    ['Create Page', () => dispatch({ type: 'ADD_PAGE', name: 'New Page' })],
    ['Preview', () => dispatch({ type: 'TOGGLE_PREVIEW', skipHistory: true })],
    ['Save', () => dispatch({ type: 'SAVE', skipHistory: true })],
  ]
  return <div className="fixed inset-0 z-50 bg-slate-900/30 p-20" onClick={close}><div className="mx-auto max-w-lg rounded-lg bg-white p-3 shadow-editor" onClick={(e) => e.stopPropagation()}>{commands.map(([label, run]) => <button key={label} className="block w-full rounded-md p-3 text-left text-sm font-semibold hover:bg-blue-50" onClick={() => { run(); close() }}>{label}</button>)}</div></div>
}

function Panel({ title, children }) {
  return <div className="p-4"><h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-slate-500">{title}</h2>{children}</div>
}
function SectionTitle({ children }) { return <h3 className="mb-2 mt-5 text-xs font-extrabold uppercase tracking-wide text-slate-500">{children}</h3> }
function Empty({ text }) { return <div className="rounded-md border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">{text}</div> }
function MiniButton({ children, ...props }) { return <button {...props} className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40">{children}</button> }
function Labeled({ label, children }) { return <label className="mb-3 block text-xs font-bold capitalize text-slate-600"><span className="mb-1 block">{label}</span>{children}</label> }
function StyleInput({ label, value, onChange, type = 'text' }) { return <Labeled label={label}><input className="field w-full rounded-md border border-slate-200 px-3 py-2 text-sm" type={type} value={value || (type === 'color' ? '#ffffff' : '')} onChange={(e) => onChange(e.target.value)} /></Labeled> }
function Segment({ label, value, options, onChange }) { return <Labeled label={label}><div className="grid grid-cols-3 gap-1">{options.map(([val, text, Icon]) => <button key={val} className={clsx('rounded-md border p-2 text-xs font-semibold', value === val || (value === 'flex-start' && val === 'left') || (value === 'flex-end' && val === 'right') ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200')} onClick={() => onChange(val)}><Icon size={14} className="mx-auto mb-1" />{text}</button>)}</div></Labeled> }

export default App
