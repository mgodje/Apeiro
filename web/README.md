# How to use

## Project Structure

The project is organized as follows:

```
web/
│
├── app.py                 # The main Flask application
├── templates/             # Directory for HTML templates
│   ├── base.html          # Base template for common layout
│   ├── index.html         # Homepage template
│   └── about.html         # About page template
├── static/                # Directory for static files (CSS, JS, images)
│   ├── css                # Stylesheets
│   │   └── styles.css     # Main Stylesheet
│   └── javascript         # JavaScript file (if any)
└── README.md              # This README file
```

### Explanation of Files and Folders

- **`app.py`**: This is the main entry point of your Flask application. It contains the routes (URL endpoints) and logic for rendering templates.
  
- **`templates/`**: This folder contains HTML templates that are rendered by Flask. The `base.html` file is a base template that other templates can inherit from, ensuring a consistent layout across your site.

- **`static/`**: This folder contains static files like CSS, JavaScript, and images. Flask serves these files directly without any processing.

- **`README.md`**: This file provides an overview of the project and instructions on how to set it up.

## Getting Started

### Prerequisites

- **Python**: Ensure Python 3.7 or higher is installed on your machine.
- **Flask**: You can install Flask using pip.

```bash
pip install -r requirements.txt
```

### Running the Application

1. **Navigate to the project directory**:

   ```bash
   cd web/
   ```

2. **Run the Flask application**:

   ```bash
   python app.py
   ```

3. **Access the application**:

   Open a web browser and navigate to `http://127.0.0.1:5000/` to view the app.

### Routes

The application contains the following routes:

- `/` : The homepage. Renders the `index.html` template.
- `/about` : The about page. Renders the `about.html` template.

### Templates

Flask uses the Jinja2 templating engine to render HTML templates. Templates allow you to dynamically generate HTML by embedding Python code within the template.

- **`base.html`**: A base template that contains the common layout (header, footer, etc.). Other templates extend this base template to maintain a consistent look and feel across the site.

- **`index.html`**: The homepage template, which extends `base.html` and includes content specific to the homepage.

- **`about.html`**: The about page template, which also extends `base.html` but includes content specific to the about page.

### Static Files

- **`styles.css`**: A basic stylesheet to style the website. It includes styles for the layout, typography, and buttons.

- **`script.js`**: (Optional) A placeholder for any JavaScript you might want to add.

### Using Static Files in Templates

Static files (like CSS, JS, and images) are linked in your HTML templates using Flask's `url_for()` function:

```html
<link rel="stylesheet" href="{{ url_for('static', filename='styles.css') }}">
```

This function generates the correct URL path to the static file.

### Customizing the Application

To customize the application:

1. **Edit the HTML templates** in the `templates/` directory to change the content and structure of the pages.
2. **Modify `styles.css`** in the `static/` directory to update the design and layout.
3. **Add new routes** in `app.py` to create additional pages or functionalities.
