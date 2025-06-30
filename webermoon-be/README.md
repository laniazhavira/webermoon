# 🚀 How to Update the Site

1. **Clone the repository** <br><br>
   ```
   git clone https://github.com/Rafif1103/mini-olt-be.git
   ```
2. **Install all the dependencies (make sure to install node)** <br><br>
   ```
   npm install
   ```
3. **Edit the changes and push it to the master branch** <br><br>
   ```
    git add .
    git commit -m "Your commit message"
    git push origin master
   ```
4. **Connect to the VPS server (remote by ssh)** <br><br>
   ```
    ssh root@145.223.99.206
   ```
5. **Pull changes from the repository (if any)** <br><br>
   ```
   git pull origin master
   ```
6. **Reload the website from the VPS** <br><br>
   ```
     pm2 reload backend_mini_olt
   ```

# Links to backend site

Link to the mini olt api: [Click Here](https://api-mini-olt.scmt-telkom.com/).

Example API: [Data For Tree Graph](https://api-mini-olt.scmt-telkom.com/api/v1/get-data).

