/// <reference types="vite/client" />

// Image module declarations
declare module '*.jpg' {
    const content: string;
    export default content;
}

declare module '*.png' {
    const content: string;
    export default content;
}
