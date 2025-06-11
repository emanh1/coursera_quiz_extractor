# Coursera Quiz Extractor

**Coursera Quiz Extractor** is a Python script that automates the extraction of quiz questions, answers, and images from Coursera courses. This tool uses **Selenium** for browser automation and **Pandas** for organizing extracted data into a CSV file.

## Prerequisites

Before running make sure you have the following installed:

- **Python**
- **Google Firefox** (for Selenium)
- **Firefoxdriver** corresponding to your Chrome version (for Selenium)

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/emanh1/coursera_quiz_extractor.git
   cd coursera_quiz_extractor
   ```

2. **Install dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3. **Set up .env file**:

    Create a .env file in the project root directory.

    Add your Coursera login credentials and other environment variables:
    
    ```.env
    EMAIL=your_email@example.com
    PASSWORD=your_password
    CAPTCHA=your_captcha_solution  # String to search for to check if there's captcha
    ```


## Usage
Run the notebook file. You may need to solve captcha to log in. When prompted, enter the course url and wait for it to finish.

---

## Browser Extension

This project also includes a Firefox extension that allows you to export quiz questions and answers directly from Coursera quiz feedback pages.

### Features
- Adds an **Export Q&A** button to Coursera quiz feedback pages.
- Extracts questions, answers, and image URLs from the page.
- Downloads the extracted data as a CSV file.

### Installation
1 .Clone this repository or download the files
2 .Go to about:debugging#/runtime/this-firefox
3 .Click "Load Temporary Add-on"
4 .Open any file of the repository


### Usage
- Navigate to a Coursera quiz feedback page (URL pattern: `https://www.coursera.org/learn/*/assignment-submission/*/view-feedback`).
- Click the **Export Q&A** button that appears at the top right of the page.
- A download prompt will pop up for the CSV file containing the questions, answers, and image URLs. Click download to get the file.


---