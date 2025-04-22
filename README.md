# Coursera Quiz Extractor

**Coursera Quiz Extractor** is a Python script that automates the extraction of quiz questions, answers, and images from Coursera courses. This tool uses **Selenium** for browser automation and **Pandas** for organizing extracted data into a CSV file.

## Prerequisites

Before running make sure you have the following installed:

- **Python**
- **Google Chrome** (for Selenium)
- **Chromedriver** corresponding to your Chrome version (for Selenium)

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

    EMAIL=your_email@example.com
    PASSWORD=your_password
    CAPTCHA=your_captcha_solution  # String to search for to check if there's captcha


## Usage
Run the notebook file. You may need to solve captcha to log in. When prompted, enter the course url and wait for it to finish.