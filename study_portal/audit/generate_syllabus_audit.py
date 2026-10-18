import json

syllabus_data = {
  "university": "Chhatrapati Shahu Ji Maharaj University, Kanpur (CSJMU)",
  "course": "Bachelor of Computer Applications (BCA)",
  "semester": "Semester V",
  "source_document": "00_Syllabus_and_Overview/CSJMU_BCA_Syllabus.docx",
  "subjects": [
    {
      "code": "BCA-5001",
      "name": "Knowledge Management",
      "credits": 4,
      "units": [
        {
          "unit_num": 1,
          "title": "Business Intelligence and Business Decisions",
          "topics": [
            "Modeling Decision Process",
            "Decision support systems (DSS)",
            "Group decision support (GDSS)",
            "Groupware Technologies"
          ],
          "page_file": "bca5001_unit1.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 2,
          "title": "Executive Information and Support Systems",
          "topics": [
            "Executive Information Systems (EIS)",
            "Business Expert System and AI",
            "OLTP & OLAP",
            "Data Warehousing",
            "Data Marts",
            "Data Warehouse architecture",
            "Tools for data warehousing"
          ],
          "page_file": "bca5001_unit2.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 3,
          "title": "Multi-Dimensional Analysis",
          "topics": [
            "Data mining and knowledge discovery (KDD)",
            "Data mining and Techniques (Classification, Clustering, Association)",
            "Data mining of Advance Databases"
          ],
          "page_file": "bca5001_unit3.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 4,
          "title": "Knowledge Management Systems",
          "topics": [
            "Concept and Structure of KM systems",
            "Techniques of knowledge management",
            "Appreciation & limitations of KMS",
            "Tacit vs Explicit Knowledge & SECI Model"
          ],
          "page_file": "bca5001_unit4.html",
          "coverage_status": "IMPLEMENTED"
        }
      ]
    },
    {
      "code": "BCA-5002",
      "name": "Java Programming and Dynamic Webpage Design",
      "credits": 3,
      "units": [
        {
          "unit_num": 1,
          "title": "Java Programming Fundamentals & Multithreading",
          "topics": [
            "Data types",
            "Control structures",
            "Arrays, strings, and vector",
            "Classes, inheritance, packages",
            "Exception handling",
            "Multithreaded programming"
          ],
          "page_file": "bca5002_unit1.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 2,
          "title": "Java Applets & AWT GUI",
          "topics": [
            "Java applets and Applet Lifecycle",
            "AWT controls (Button, Labels, Combo box/Choice, List)",
            "Listeners and Event Delegation",
            "Menu bar",
            "Layout managers (Flow, Border, Grid)",
            "String handling main functions"
          ],
          "page_file": "bca5002_unit2.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 3,
          "title": "JDBC (Java Database Connectivity)",
          "topics": [
            "JDBC Fundamentals & Architecture",
            "4 Driver Types",
            "Establishing Connectivity (5 Steps)",
            "Working with Connection Interface",
            "Working with Statements (Statement, PreparedStatement, CallableStatement)",
            "Creating and Executing SQL Statements",
            "Working with ResultSet Objects"
          ],
          "page_file": "bca5002_unit3.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 4,
          "title": "Java Servlets",
          "topics": [
            "Introduction to Servlets",
            "HTTP Servlet Basics",
            "The Servlet Lifecycle (init, service, destroy)",
            "Retrieving Information (HttpServletRequest)",
            "Sending HTML Information (HttpServletResponse)",
            "Session Tracking (Cookies, HttpSession, URL Rewriting)"
          ],
          "page_file": "bca5002_unit4.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 5,
          "title": "Java Server Pages (JSP)",
          "topics": [
            "Introducing Java Server Pages (JSP Architecture & Lifecycle)",
            "JSP Overview vs Servlets",
            "Setting Up the JSP Environment",
            "Generating Dynamic Content (Scriptlets, Expressions, Declarations)",
            "Using Custom Tag Libraries and JSTL",
            "Processing Input and Output"
          ],
          "page_file": "bca5002_unit5.html",
          "coverage_status": "IMPLEMENTED"
        }
      ]
    },
    {
      "code": "BCA-5003",
      "name": "Computer Network",
      "credits": 4,
      "units": [
        {
          "unit_num": 1,
          "title": "Basic Concepts, Topologies & OSI/TCP Models",
          "topics": [
            "Components of data communication",
            "Distributed processing, standards and organizations",
            "Line configuration, topology (Mesh, Star, Bus, Ring)",
            "Transmission modes and categories of networks",
            "OSI and TCP/IP Models (Layers and functions, comparison)",
            "Digital Transmission: DTE-DCE Interface, Modems, Cable modems"
          ],
          "page_file": "bca5003_unit1.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 2,
          "title": "Transmission Media & Physical Layer",
          "topics": [
            "Guided and unguided transmission media",
            "Attenuation, distortion, noise",
            "Throughput, propagation speed and time, wavelength",
            "Shannon capacity and Nyquist theorem",
            "Comparison of media"
          ],
          "page_file": "bca5003_unit2.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 3,
          "title": "Telephony, Multiplexing & Data Link Control",
          "topics": [
            "Multiplexing (WDM, TDM, FDM)",
            "Circuit switching, packet switching, message switching",
            "Data link control protocols: Line discipline, flow control, error control",
            "Synchronous/asynchronous, character/bit oriented protocols (Bit stuffing)",
            "Point to point controls (PPP layers, LCP, NCP)",
            "ISDN: Services, subscriber access, ISDN layers"
          ],
          "page_file": "bca5003_unit3.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 4,
          "title": "Network Devices & Network Layer",
          "topics": [
            "Devices: Repeaters, bridges, gateways, routers, switches, hubs",
            "The Network Layer design issues",
            "Internetworking",
            "IPv4 & IPv6 addressing and Subnetting",
            "Routing algorithms"
          ],
          "page_file": "bca5003_unit4.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 5,
          "title": "Transport & Upper Layers in OSI Model",
          "topics": [
            "Transport layer functions & process-to-process delivery",
            "Connection management (TCP 3-Way Handshake & Teardown)",
            "TCP vs UDP",
            "Session layer functions",
            "Presentation layer functions (Syntax, Cryptography)",
            "Application layer (DNS, HTTP, FTP, SMTP, POP3, MIME)"
          ],
          "page_file": "bca5003_unit5.html",
          "coverage_status": "IMPLEMENTED"
        }
      ]
    },
    {
      "code": "BCA-5004",
      "name": "Numerical Methods",
      "credits": 4,
      "units": [
        {
          "unit_num": 1,
          "title": "Roots of Equations",
          "topics": [
            "Bisection Method",
            "False Position (Regula-Falsi) Method",
            "Newton-Raphson Method",
            "Rate of convergence of Newton's method (Quadratic p=2)",
            "Descartes' Rule of Signs"
          ],
          "page_file": "bca5004_unit1.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 2,
          "title": "Interpolation and Extrapolation",
          "topics": [
            "Finite Differences (Delta, Nabla)",
            "The operator E and relation with Delta, Nabla, D",
            "Newton's Forward and Backward Differences",
            "Newton's divided differences formulae",
            "Lagrange's Interpolation formula for unequal Intervals"
          ],
          "page_file": "bca5004_unit2.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 3,
          "title": "Numerical Differentiation & Integration",
          "topics": [
            "Introduction and direct methods from difference tables",
            "Maxima and minima of a tabulated function",
            "General Quadrature formula",
            "Trapezoidal Rule",
            "Simpson's 1/3 Rule",
            "Simpson's 3/8 Rule"
          ],
          "page_file": "bca5004_unit3.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 4,
          "title": "Solution of Linear Equations",
          "topics": [
            "Gauss's Elimination method",
            "Partial Pivoting",
            "Gauss-Seidel iterative method",
            "Diagonal dominance condition"
          ],
          "page_file": "bca5004_unit4.html",
          "coverage_status": "IMPLEMENTED"
        },
        {
          "unit_num": 5,
          "title": "Solution of Differential Equations",
          "topics": [
            "Euler's method",
            "Picard's method of successive approximations",
            "Fourth-order Runge-Kutta method (RK-4)"
          ],
          "page_file": "bca5004_unit5.html",
          "coverage_status": "IMPLEMENTED"
        }
      ]
    }
  ]
}

with open('study_portal/data/syllabus-coverage.json', 'w') as jf:
    json.dump(syllabus_data, jf, indent=2)

with open('study_portal/audit/syllabus-audit.md', 'w') as mf:
    mf.write('# Official CSJMU BCA 5th Semester Syllabus Coverage Audit\n\n')
    mf.write(f"**Authority:** {syllabus_data['university']}\n")
    mf.write(f"**Course:** {syllabus_data['course']} - {syllabus_data['semester']}\n")
    mf.write(f"**Source Document:** `{syllabus_data['source_document']}`\n\n")
    for sub in syllabus_data['subjects']:
        mf.write(f"## {sub['code']}: {sub['name']} ({len(sub['units'])} Units)\n\n")
        mf.write('| Unit | Title | Prescribed Syllabus Topics | Page File | Status |\n')
        mf.write('|---|---|---|---|---|\n')
        for u in sub['units']:
            topics_str = '<br>• '.join(u['topics'])
            mf.write(f"| Unit {u['unit_num']} | **{u['title']}** | • {topics_str} | `{u['page_file']}` | `{u['coverage_status']}` |\n")
        mf.write('\n')

print("Created syllabus-coverage.json and syllabus-audit.md successfully.")
