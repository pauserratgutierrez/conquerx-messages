# ConquerX Messages

A browser extension that auto-injects message templates for ConquerX CRM to streamline Setter workflows and communication with leads.

## Overview

A floating message bubble is added to ConquerX CRM pages. It provides quick access to pre-defined message templates. It's designed to help Setters efficiently communicate with leads during the scheduling and confirmation process.

## Features

- **Smart Page Detection**: Only activates on ConquerX CRM schedule update pages (Normal Lead Call Page).
- **Dynamic Message Templates**: Automatically populates templates with lead data from the page
- **One-Click Copy**: Click any template to copy it to your clipboard
- **Closer Assignment**: Automatically detects and assigns the appropriate closer based on domain
- **Multi-Domain Support**: Works with ConquerBlocks, ConquerFinance, and ConquerLanguages
- **LATAM Support**: Special handling for Latin American leads

## Installation

1. Download the files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extension` folder
5. The extension will now be active on ConquerX CRM pages

## Message Templates

The extension provides several message categories:

### No Contesta (N1-N5)
- **N1**: Initial contact attempt
- **N1 (Latam)**: Special message for Latin American leads
- **N2-N5**: Follow-up messages with increasing urgency

### Pre-Llamadas (N1 Pre, N2 Pre)
- Messages for leads who haven't completed the scheduling process

### Actions
- **✅ Confirmar**: Confirmation message with closer details
- **❌ Cancelar (Latam)**: Cancellation with specific LATAM calendar link

## How It Works

1. Navigate to a ConquerX CRM schedule update page
2. A floating 💬 bubble appears in the bottom-right corner
3. Click the bubble to reveal message template options
4. Click any template to automatically copy it to your clipboard
5. The message is populated with lead-specific data from the page

## Data Extraction

The extension automatically extracts the following information from the CRM page:
- Lead name
- Closer email
- Scheduled call date and time
- Event type (Blocks, Finance, Languages)

## Author

**Pau Serrat Gutiérrez**  
[GitHub Repository](https://github.com/pauserratgutierrez/conquerx-messages)