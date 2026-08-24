# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React, TypeScript en Vite voor de statische frontend; Supabase Auth, PostgreSQL, Row Level Security, Storage en Edge Functions voor de backend. Publicatie via GitHub Pages op een project-URL.

## Users

- Trainers en beheerders beheren spelers, perioden, Groeiwaarde en persoonlijke coachingcontent.
- Spelers loggen individueel in om het teamoverzicht en uitsluitend hun eigen coachingcontent te bekijken.

## Product Purpose

Marpunten maakt persoonlijke voetbalontwikkeling zichtbaar en geeft trainers een eenvoudige centrale plek om progressie, leeritems en relevante media per speler te beheren. De MVP is geslaagd wanneer een trainer de volledige cyclus van speler toevoegen tot persoonlijke content delen zelfstandig kan uitvoeren en spelers die omgeving daadwerkelijk gebruiken.

## Positioning

Groeiwaarde vertaalt behaalde persoonlijke progressie naar een herkenbare FIFA-achtige eurowaarde zonder er een ranglijst of spelersrating van te maken.

## Operating Context

Eén voetbalteam gebruikt de website gedurende vrij benoembare trainings- of competitieperioden. De admin deelt loginnaam en wachtwoord buiten de applicatie met een speler. YouTube-fragmenten en externe links ondersteunen individuele coaching; grote bestanden worden niet geüpload.

## Capabilities and Constraints

- Rollen zijn `admin` en `player`; er is één initiële admin en één team.
- Login gebruikt een unieke loginnaam en een admin-beheerd wachtwoord, zonder publieke registratie of e-mailflow.
- Groeiwaarde wordt als gehele positieve punten opgeslagen; 100 punten wordt als €100K weergegeven.
- Een admin kan een behaald leeritem atomair omzetten naar progressie; het leeritem verdwijnt pas wanneer de progressie is opgeslagen.
- Teamgenoten zien openbare profielvelden en totalen, maar nooit andermans progressieomschrijvingen, leeritems of media.
- Perioden hebben een naam, volgorde en huidige status, zonder datums of vergrendeling.
- Spelers worden gedeactiveerd, niet permanent verwijderd.
- De MVP bevat geen ranking, chat, notificaties, AI-feedback, badges, aanwezigheid, kalender of wedstrijdstatistieken.

## Brand Commitments

De productnaam is Marpunten. De interface is Nederlandstalig en voelt als een professionele voetbalacademie: tactisch, helder en motiverend. Die uitstraling mag nooit suggereren dat Groeiwaarde bepaalt wie de beste speler is.

## Evidence on Hand

De goedgekeurde MVP-specificatie in de gebruikersopdracht is de inhoudelijke bron. Er zijn nog geen merkassets, logo's, foto's, testimonials of echte spelersgegevens aangeleverd; de applicatie mag die niet fabriceren als bewijs.

## Product Principles

1. Persoonlijke ontwikkeling, geen competitie tussen spelers.
2. Persoonlijke coachingcontent blijft aantoonbaar privé.
3. De belangrijkste trainerstaken zijn vanaf één spelerspagina bereikbaar.
4. Eenvoudige perioden en event-gebaseerde progressie houden correcties beheersbaar.
5. Elke lege, fout- en laadstatus helpt de gebruiker verder.

## Accessibility & Inclusion

De interface werkt vanaf 320 px breed, volledig met toetsenbord, met zichtbare focus, voldoende kleurcontrast en respect voor `prefers-reduced-motion`.
