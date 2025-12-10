# Team 21: Kainos CTO Project Proposal



## Table of content

- [About](#about)
- [Project member](#team)
- [Install & Setup](#install)

---

## <a id="about"></a>📋 About

Kainos CTO Project Proposal

---

## <a id="team"></a>👥 Project member

| Name                   | Email                   |
|------------------------|-------------------------|
| Basil Chirathilattu    | psybc14@nottingham.ac.uk|
| Hiu Yeung              | psyhy7@nottingham.ac.uk |
| Kanisorn Pojanavaraphan| psykp4@nottingham.ac.uk |
| Lara Baker             | psylb11@nottingham.ac.uk|
| Rahma Suleiman         | psyrs21@nottingham.ac.uk|
| Shiyi Chen             | scysc8@nottingham.ac.uk |
| Syed Maaz Hussain      | psysh17@nottingham.ac.uk|
| Xuefei Wu              | scyxw12@nottingham.ac.uk|
| Xutong Zhai            | scyxz11@nottingham.ac.uk|


--- 

## <a id="install"></a>🛠️ Install & Setup !!

1. Install nodeJS from the website or through the terminal!
    [[https://nodejs.org/en/download]]
2. Ensure the path has been defined otherwise npm will not be able to be accessesd

3. Clone the git repositry in VScode
    ```
    git clone https://projects.cs.nott.ac.uk/comp2002/2025-2026/team21_project.git
    ```
4. Access the file and run `npm start` in the VScode terminal- Ideally it is going to say that you dont have electron installed
    ```
    cd team21_project
    # npm start wont work unless you have installed electron
    npm start 
    ```
    
5. Then type `npm install electron --save-dev` in the VScode terminal
    ```
    npm install electron --save-dev
    ```

6. Type `pip install flask groq python-dotenv flask-cors` in the VScode terminal
    ```
    pip install flask groq python-dotenv flask-cors
    ```

7. create a file called `.env` and write in following 
    ```
    GROQ_API_KEY="REMOVED"
    ```

8. Try `npm start` again and it should run!
    ```
    npm start
    ```