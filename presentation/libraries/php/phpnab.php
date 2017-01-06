<?php
//=========================================================================
function publishRunStepperMotorBasic($prango_url,$global,$local,$client,$streamindex,$dir,$dbs,$nos,$ss)
//=========================================================================
{
  $options = array(
      'http' => array(
          'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
          'method'  => 'GET'
      )
  );

  $request_message_type = 6; 
  $request_message_url = "$prango_url?request_message_type=$request_message_type";

  $context  = stream_context_create($options);
  $result = file_get_contents($request_message_url, false, $context);
  if ($result === FALSE) { echo "could not get message structure"; }

  $message_structure_json = json_decode($result);
  $array_GET = array('message_type'=>$request_message_type,
                      'global'=>$global,
                      'local'=>$local,
                      'client'=>$client,
                      'stream_index'=>$streamindex);

  $fields = $message_structure_json->fields;
  //Loop through all fields of message structure
  foreach ($fields as $field){

      if ($field->field_type == 'float')
          $array_GET[$field->field_name] = 0.0;
      elseif ($field->field_type == 'string')
          $array_GET[$field->field_name] = "";
      else
          $array_GET[$field->field_name] = 0;
  }
  // CLOCKWISE = 0;
  // COUNTER_CLOCKWISE = 1;
  // FULL_STEP = 0;
  // HALF_STEP = 1;
  // QUARTER_STEP = 2;
  $array_GET['direction'] = $dir;
  $array_GET['delay_between_steps'] = $dbs;
  $array_GET['number_of_steps'] = $nos;
  $array_GET['stepSize'] = $ss;
  $data = http_build_query($array_GET);

  $context  = stream_context_create($options);
  $result = file_get_contents("$prango_url?$data", false, $context);
  if ($result === FALSE) { echo "could not publish "; }
  // status code 201 indicates that everything went fine
  //var_dump($http_response_header);
}

//=========================================================================
function publishTrigger($prango_url,$global,$local,$client,$streamindex)
//=========================================================================
{
  $options = array(
      'http' => array(
          'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
          'method'  => 'GET'
      )
  );

  $request_message_type = 11; // trigger
  $request_message_url = "$prango_url?request_message_type=$request_message_type";

  $context  = stream_context_create($options);
  $result = file_get_contents($request_message_url, false, $context);
  if ($result === FALSE) { echo "could not get message structure"; }

  $message_structure_json = json_decode($result);
  $array_GET = array('message_type'=>$request_message_type,
                      'global'=>$global,
                      'local'=>$local,
                      'client'=>$client,
                      'stream_index'=>$streamindex);

  $fields = $message_structure_json->fields;
  //Loop through all fields of message structure
  foreach ($fields as $field){

      if ($field->field_type == 'float')
          $array_GET[$field->field_name] = 0.0;
      elseif ($field->field_type == 'string')
          $array_GET[$field->field_name] = "";
      else
          $array_GET[$field->field_name] = 0;
  }

  $array_GET['timestamp'] = 14;
  $data = http_build_query($array_GET);

  $context  = stream_context_create($options);
  $result = file_get_contents("$prango_url?$data", false, $context);
  if ($result === FALSE) { echo "could not publish "; }
  // status code 201 indicates that everything went fine
  //var_dump($http_response_header);
}

//=========================================================================
function getLatestValue($prango_url,$rest_url,$global,$local,$client,$messagetype,$streamindex)
//=========================================================================
{
  $options = array(
    'http' => array(
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'GET'
    )
  );
  $rest_url = $rest_url.'/liststreams';
  $request_message_url = "$prango_url?request_message_type=$request_message_type";
  $context  = stream_context_create($options);
  $result = file_get_contents($rest_url, false, $context);
  $streams = json_decode($result);

  $res = 999;
  $n = 0;
  //var_dump($streams);
  foreach ($streams as $stream)
  {
    //echo("$stream"); 
    // echo("\n");
    // echo $stream->nb_sid;
    // echo $stream->nb_global; echo $global;
    // echo $stream->nb_local;
    // echo $stream->nb_client_id;
    // echo $stream->nb_stream_index;
    // echo $stream->nb_message_type;
    // echo $stream->nb_message_name;
    // echo $stream->nb_creation_ts;
    // echo $stream->update_ts;
    // echo $stream->latestvalue;
    if(($global == $stream->nb_global) && ($local == $stream->nb_local) && ($client == $stream->nb_client_id) && ($messagetype == $stream->nb_message_type) && ($streamindex == $stream->nb_stream_index))
    {
      $res = $stream->latestvalue;
      $n++;
    }
  }
  if($n == 1)
    {
      if($messagetype != 10)$res = number_format($res, 2);
      return $res;
    }
  else
    return 998;
}

//=========================================================================
function getLatestValueTs($prango_url,$rest_url,$global,$local,$client,$messagetype,$streamindex)
//=========================================================================
{
  $options = array(
    'http' => array(
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'GET'
    )
  );
  $rest_url = $rest_url.'/liststreams';
  $request_message_url = "$prango_url?request_message_type=$request_message_type";
  $context  = stream_context_create($options);
  $result = file_get_contents($rest_url, false, $context);
  $streams = json_decode($result);

  $res = 999;
  $n = 0;
  //var_dump($streams);
  foreach ($streams as $stream)
  {
    //echo("$stream"); 
    // echo("\n");
    // echo $stream->nb_sid;
    // echo $stream->nb_global; echo $global;
    // echo $stream->nb_local;
    // echo $stream->nb_client_id;
    // echo $stream->nb_stream_index;
    // echo $stream->nb_message_type;
    // echo $stream->nb_message_name;
    // echo $stream->nb_creation_ts;
    // echo $stream->update_ts;
    // echo $stream->latestvalue;
    if(($global == $stream->nb_global) && ($local == $stream->nb_local) && ($client == $stream->nb_client_id) && ($messagetype == $stream->nb_message_type) && ($streamindex == $stream->nb_stream_index))
    {
      $res = $stream->update_ts;
      $n++;
    }
  }
  if($n == 1)
    {
      $d = new DateTime($res);
      $res = $d->format('Y-m-d H:i:s');
      return $res;
    }
  else
    return 997;
}

?>


