<?php

$string = file_get_contents("configuration.json");
$json_a = json_decode($string, true);
$host = $json_a['mysqlDatabase']['host'];
$user = $json_a['mysqlDatabase']['user'];
$pswd = $json_a['mysqlDatabase']['password'];
$db   = $json_a['mysqlDatabase']['db'];

$mysqli = new mysqli($host,$user,$pswd,$db);

$delete = 0;
$delete = $_GET['sid'];


if($delete > 0)
{
  $msgname = $_GET['msgname'];
  $table = 'stream_'.$delete.'_'.$msgname;
  $sql = "DELETE FROM streams WHERE sid=$delete";
  echo("delete stream definition $delete<br>");
  $result = $mysqli->query($sql);
  $sql = "DROP TABLE IF EXISTS $table";
  echo("delete table $table<br>");
  $result = $mysqli->query($sql);
}


$sql = "SELECT * FROM  streams";
$result = $mysqli->query($sql);
$count = $result->num_rows;
print "<a href=cleanupDb.php> refresh </a>";
print "Number of streams: $count <hr/>";
echo("<table border = 0>");
while ($row = $result->fetch_assoc()) {
    echo("<tr>");
    $sid = $row['sid'];
    echo("<td>$sid</td>");
    $global = $row['global'];
    echo("<td>$global</td>");
    $local = $row['local'];
    echo("<td>$local</td>");
    $client_id = $row['client_id'];
    echo("<td>$client_id</td>");
    $message_name = $row['message_name'];
    echo("<td>$message_name</td>");
    print "<td><a href=cleanupDb.php?sid=$sid&msgname=$message_name> delete </a></td></tr>";
}

echo("</table>");
?>
