const template = `
<!DOCTYPE html>
<html lang="zh-CN">
    <head>
        <meta charset="utf-8">
        <title>GitHub Proxy 加速</title>
        <meta name="description" content="Accelerates GitHub api, release, archive, and project file downloads for improved accessibility.">
        <meta name="description" content="加速 GitHub api、release、archive 以及项目文件下载，提高访问性。">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            div {
                display: block;
            }

            a {
                margin: 0.4rem;
                text-decoration: none;
            }

            *, ::after, ::before {
                -webkit-box-sizing: inherit;
                box-sizing: inherit;
            }

            p {
                margin: 0 0 1rem;
            }

            body {
                overscroll-behavior: none;
                height: 100%;
                width: 100%;
                margin: 0;
                padding: 0;
                font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
            }

            .text-center {
                text-align: center;
            }

            .orange {
                color: #EA7500;
            }

            .gray {
                color: #667189;
            }

            .section {
                box-sizing: border-box;
                padding: 1rem .5rem;
                background-color: #f8f9fa;
            }

            .main {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }

            .main .desc {
                max-width: 45rem;
                font-size: medium;
                word-break: break-all;
            }

            .main .form {
                width: 100%;
            }

            .form input{
                line-height: 2rem;
                width:100%;
                height: 2rem;
                max-width: 22rem;
                outline-style: none ;
                border: 1px solid #ccc; 
                border-radius: 5px;
                
            }

            .form button{
                line-height: 2rem;
                height: 2rem;
                outline-style: none ;
                border: 0px; 
                border-radius: 5px;
                color: #fff;
                background-color: #EA7500;
                margin-top: 0.25rem;
            }

            .footer {
                background-color: white;
            }

            .copyright {
                padding-bottom: 1rem;
            }

            .float-left {
                float: left;
            }

            .float-right {
                float: right;
            }
        </style>
    </head>
    <body>
        <div class="section main text-center">
            <h1>GitHub Proxy 加速</h1>
            <form class="form" onsubmit="onSubmit(event)">
                <input type="url" name="url" id="" placeholder="https://github.com/menghuu/cloudflare-github-proxy/blob/main/src/index.ts">
                <button type="submit">下载🚀</button>
            </form>
            <br>
            <div class="desc gray">
                <!-- <p class="orange">该站点为个人自用兼 Demo 站，仅加速 asjdf 相关库，如有其他使用需求请自行部署。</p> -->
                <p>支持 GitHub API、Release、Archive 以及文件（除文件夹），右键复制出来的链接皆符合标准。</p>
                <p>API、Release、Archive 使用 CF 加速，文件重定向至 JsDelivr</p>
                <p class="orange">支持的链接格式如下：</p>
                <p>分支源码：https://github.com/asjdf/project/archive/master.zip</p>
                <p>Archive：https://github.com/asjdf/project/archive/v0.1.0.tar.gz</p>
                <p>Release：https://github.com/asjdf/project/releases/download/v0.1.0/example.zip</p>
                <p>分支文件：https://github.com/asjdf/project/blob/master/filename</p>
                <p>Commit文件：https://github.com/asjdf/project/blob/111111/filename</p>
                <p>Gist：https://gist.githubusercontent.com/asjdf/foo/raw/bar.py</p>
                <p><del>API：https://api.github.com/repos/asjdf/project/releases/latest</del></p>
            </div>
        </div>
        <div class="section footer">
            <div class="copyright">
                <div class="float-right">
                    <a href="https://github.com/hunshcn/gh-proxy" class="gray">hunshcn</a>
                    |
                    <a href="https://github.com/asjdf/ghproxy" class="gray">asjdf</a>
                    |
                    <a style="opacity:0.7" class="gray" href='https://github.com/menghuu/cloudflare-github-proxy'>m</a>
                </div>
                <div class="float-left">
                    Powered by
                    <a href="https://workers.cloudflare.com/" class="gray">Cloudflare Workers</a>
                </div>
            </div>
        </div>
    </body>
    <script>
        function onSubmit(e) {
            e.preventDefault()
            window.open(location.href.substr(0, location.href.lastIndexOf('/') + 1) + document.getElementsByName('url')[0].value, target='_blank');
            return false
        }
    </script>
</html>
`

export default template
