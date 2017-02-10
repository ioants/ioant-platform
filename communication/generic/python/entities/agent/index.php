<?php
//=========================================
//
// 2017-01-30
//=========================================
//=======================================
function lib_listFileContent($filename)
//=======================================
{
    $handle = fopen($filename, "r");
    if ($handle)
    {
        while (($line = fgets($handle)) !== false)
        {
          sscanf($line,"%d %s %s %s %s",$sid,$appid,$ip,$yymmdd,$hhmmss);
          echo "$line<br>";
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] == "POST")
{
    $formid = $_POST['formid'];
    if($formid == 'addsub')
    {
        $global        = $_POST['global'];
        $local         = $_POST['local'];
        $clientid      = $_POST['clientid'];
        $messagetype   = $_POST['messagetype'];
        $streamindex   = $_POST['streamindex'];
    }

}

$action = $_GET['action'];

//=========================================
echo("<!doctype html>");
echo("<html>");
echo("<head>");
    echo("<title>XSIM Remote Control</title>");
    echo("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />");
    echo("<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js\"></script>");
    echo("<style>");
    echo("
    body {
        text-align: center;
        margin-bottom: 100px;
        background: black;
        font-family: monospace;
    }
    #d_container{
        position: relative;
        background: black;
        border: 0px solid #AAAAAA;
        padding: 0px;
        color: white;
        width: 100%;
        height: 100%;
    }
    #d_center{
        position: relative;
        background: black;
        border: 0px solid #AAAAAA;
        padding: 0px;
        color: white;
        width: 100%;
        height: 100%;
    }
    #d_left{
        display: inline-block;
        float: left;
        background: black;
        border: 0px solid #AAAAAA;
        padding: 0px;
        color: red;
        width: 50%;
        text-align: left;
    }

    #d_right{i
        display: inline-block;
        float: left;
        background: black;
        border: 0px solid #AAAAAA;
        padding: 0px;
        color: red;
        width: 100%;
        text-align: left;
    }
    #d_header{
        position:inline-block;
        background: black;
        border: 0px solid #AAAAAA;
        padding: 0px;
        color: green;
        height: 10%
        width: 100%;
    }

    ");
echo("</style>");
echo("</head>");
echo("<body>");
echo("<div id=\"d_container\">");

echo("<div id=\"d_left\">");

if($action)
{
    echo("action= $action<br>");
}
if($formid)
{
    echo("formid = $formid<br>");
    if($formid == 'addsub')
    {
        $ffile = "live-$global-$local-$clientid-$messagetype-$streamindex";
        echo("$ffile<br>");
        system("pwd");
        system("touch newsub/$ffile");
    }

}

echo "Subscriptions<br>";
system("ls sub/* > sub_list.pscp");
lib_listFileContent("sub_list.pscp");

echo "Timestamps<br>";
system("ls time/* > time_list.pscp");
lib_listFileContent("time_list.pscp");

echo "Data<br>";
system("ls data/* > data_list.pscp");
lib_listFileContent("data_list.pscp");


echo("<table>
      <form action=\"index.php\" method=\"post\">
            <input type=\"hidden\" name=\"formid\" value=\"addsub\" />
            <tr><td>Global</td><td><input type=\"text\" name=\"global\" value=\"$global\" size=\"20\" /></td></tr>
            <tr><td>Local</td><td><input type=\"text\" name=\"local\" value=\"$local\" size=\"20\" /></td></tr>
            <tr><td>Client Id</td><td><input type=\"text\" name=\"clientid\" value=\"$clientid\" size=\"20\" /></td></tr>
            <tr><td>Message type</td><td><select name=\"messagetype\">
                <option value=\"4\">Temperature</option>
                <option value=\"5\">Humidity</option>
                <option value=\"6\">Mass</option>
                <option value=\"8\">ElectricPower</option>
            </select></td></tr>
            <tr><td>stream Index</td><td><select name=\"streamindex\">
                <option value=\"0\">0</option>
                <option value=\"1\">1</option>
                <option value=\"2\">2</option>
                <option value=\"3\">3</option>
                <option value=\"4\">4</option>
                <option value=\"5\">5</option>
                <option value=\"6\">6</option>
                <option value=\"7\">7</option>
            </select></td></tr>
            <tr><td>-</td><td><button type=\"submit\">Add Subscription</button></td><td></tr>
      </form>
      </table>
");


echo("</div>");
echo("</div>");


echo("</body>");
echo("</html>");
?>
