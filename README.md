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

cd /home/dev/www/easypay
pm2 restart node ./bin/www

pm2 start node ./bin/www

// npm i caver-js
const Caver = require('caver-js')
const caver = new Caver('http://192.168.1.157:8217/')
const wallet = caver.klay.accounts.create(process.env.C4EI_ADDR_PWD);

docker inspect --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' c4ei2dbsrc_idx-database_1 

web3.utils.toWei
caver.utils.convertFromPeb(caver.utils.hexToNumberString(result));
web3.utils.toWei(txt_to_amt,'ether')

pm2 flush
pm2 log
c4ei2dbsrc_idx-database_1 (5589e286f195)

docker rename c4ei2dbsrc_idx-database_1 c4eiMysql
Docker run - 자동 재시작하기
sudo docker run -it --restart=always --name "c4eiMysql"
docker run --name c4eiMysql --restart unless-stopped -d -p 3306:3306 mysql:5.7
