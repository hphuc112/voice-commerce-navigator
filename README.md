# Voice-Activated E-Commerce Navigation System

[Thesis Report (PDF)](https://drive.google.com/file/d/18Qc-Nd5Cza-4ciu5AfU5wTjmh1E1n-oj/view?usp=sharing)

A thesis project implementing voice navigation in e-commerce websites using the Web Speech API, enhancing accessibility and efficiency through hands-free interaction.

## Table of Contents

- [Abstract](#abstract)
- [Features](#features)
- [Thesis Components](#thesis-components)
- [Technical Stack](#technical-stack)
- [Methodology](#methodology)
- [Results](#results)
- [Future Work](#future-work)
- [Acknowledgments](#acknowledgments)

## Abstract

This project introduces a voice-activated navigation layer for e-commerce platforms, providing:

- Hands-free product navigation
- Voice-controlled cart management (add, remove, adjust quantities)
- Natural-language product search and filtering
- Seamless multi-page voice navigation

## Features

### Core Functionality

- Voice-driven page navigation
- Natural-language product search
- Voice-controlled cart management
- Visual and auditory feedback via ARIA live regions and SpeechSynthesis
- Cross-page state persistence using Web Storage API

### E-Commerce Features

- Demo authentication (username: `demo@example.com`, password: `demo123`)
- Dynamic product catalog loading
- Persistent shopping cart
- Voice-based quantity selection

## Thesis Components

- **Literature Review**: Survey of voice UI in e-commerce and accessibility research (Chapter 2)
- **Comparative Analysis**: Evaluation of existing voice-navigation solutions (Chapter 5)
- **Prototype Development**: Implementation details of the voice navigator (Chapter 4)
- **User Testing**: Usability study with **50 participants** to measure efficiency and satisfaction (Chapter 5)
- **Statistical Analysis**: Task completion times, SUS scores, and ANOVA results (Chapter 5)

## Technical Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **APIs:** Web Speech API (SpeechRecognition & SpeechSynthesis), Web Storage API
- **Design:** Responsive grid layout, CSS custom properties, animations
- **Tooling:** Visual Studio Code, Git/GitHub, Chrome DevTools

## Methodology

Detailed in Chapter 3, the project followed an agile approach with user stories, sprint planning, and iterative prototyping. Data collection protocols and participant selection criteria are documented alongside pilot testing procedures.

## Results

- **Navigation Efficiency:** Voice navigation achieved approximately **52% faster** task completion times compared to traditional UI methods.
- **User Satisfaction:** Measured via System Usability Scale (SUS); results indicate high usability across participant groups.

## Future Work

- **Multilingual Support:** Extend voice commands to multiple languages and dialects.
- **Advanced NLP:** Integrate contextual language understanding for more nuanced queries.
- **Accessibility Enhancements:** Further compliance with WCAG guidelines and inclusive design.
- **Scalability & Security:** Research enterprise-grade frameworks and secure voice workflows.
- **Longitudinal Studies:** Assess long-term adoption and learning curves.

## Acknowledgments

- **Thesis Advisor:** Prof. Ly Tu Nga
- **Web Speech API Documentation Team**
- **Open Source Community**

## Demo

[Live Demo](https://hphuc112.github.io/voice-commerce-navigator/)
