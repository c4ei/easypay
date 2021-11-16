# easypay
curl -O https://cozmo.github.io/jsQR/jsQR.js

출처: https://ugong2san.tistory.com/3383 [UGONG2SAN]

1) 설치명령어 : npm i -g express-generator
2) express -e easypay (express easypay project 생성)
3) npm i

run the app:
     $ DEBUG=easypay:* npm start

pm2
1) npm i -g pm2
2) pm2-dev /home/dev/www/easypay 로 서버 실행
3) localhost:3000으로 확인

4. qrcode
1) npm i -S qrcode 로 library 설치
2) index.js에 qrcode를 불러오고 코드 추가

http://localhost:3000/
http://localhost:3000/reader.html

nvm install 16.13.0
npm start

npm init react-app easypay
https://github.com/ggbbest/easypay


web3.personal.importRawKey("private key", "password")

sudo npm install pm2@latest -g
pm2 start node ./bin/www
pm2 list
pm2 logs
pm2 logs --lines 200

git config --global user.name "ggbbest"
git config --global user.email www.ggb.best@gmail.com
ssh -T www.ggb.best@gmail.com
git remote set-url origin git@github.com:ggbbest/easypay.git
git config -l
git push origin main --force
git remote set-url origin git@github.com:git@github.com:ggbbest/easypay.git

pm2 restart node ./bin/www

pm2 start node ./bin/www

