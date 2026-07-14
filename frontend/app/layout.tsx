import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
const sans=IBM_Plex_Sans({subsets:['latin'],weight:['400','500','600','700'],variable:'--font-plex'})
const mono=IBM_Plex_Mono({subsets:['latin'],weight:['400','500','600'],variable:'--font-plex-mono'})
export const metadata:Metadata={title:'EURO Customs | Operations Control',description:'Customs and warehouse management for EURO TROUSERS MFG. CO. (FZC)'}
export const viewport:Viewport={themeColor:'#0d2630',colorScheme:'light dark',width:'device-width',initialScale:1}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`bg-background ${sans.variable} ${mono.variable}`}><body className="font-sans">{children}</body></html>}
