<?php slot::start('head') ?>
    <title>Build Report for <?php out::H($product) ?> <?php out::H($version) ?></title>
    <?php echo html::script(array(
       'js/jquery/plugins/ui/jquery.tablesorter.min.js',
       'js/jquery/plugins/jquery.girdle.min.js',
    ))?>
    <?php echo html::stylesheet(array(
        'css/flora/flora.tablesorter.css'
    ), 'screen')?>

<?php slot::end() ?>
<div class="page-heading">
  <h2>Build Report for <span class="current-product"><?php out::H($product) ?></span> <span class="current-version"><?php out::H($version) ?></span></h2>
    <ul class="options">
      <li><a href="<?php echo url::base(); ?>build/byversion/<?php echo $product ?>/<?php echo $version ?>" class="selected">By Product/Version</a></li>
    </ul>
    <ul class="options">
      <li><a href="<?php out::H($url_base); ?>?duration=3" <?php if ($duration == 3) echo ' class="selected"'; ?>>3 days</a></li>
      <li><a href="<?php out::H($url_base); ?>?duration=7" <?php if ($duration == 7) echo ' class="selected"'; ?>>7 days</a></li>
      <li><a href="<?php out::H($url_base); ?>?duration=14" <?php if ($duration == 14) echo ' class="selected"'; ?>>14 days</a></li>
    </ul>
</div>
<div class="panel">
  <div class="title">
    <h2>Crashes</h2>
  </div>
  <div class="body">
    <?php if ($resp) { ?>
      <div id="build-chart"></div>
    <?php } else { ?>
      <p>No builds were available for <?php echo $product ?> <?php echo $version ?></p>
    <?php } ?>
  </div>
</div>
<div class="panel">
  <div class="body notitle">
    <table id="signatureList" class="tablesorter">
      <thead>
        <tr>
          <th class="header">Build</th>
          <th class="header">Crashes</th>
          <th class="header">ADU</th>
        </tr>
      </thead>
      <tbody>
<?php
if ($resp) {
    foreach ($resp->build as $entry) {
        $sigParams = array(
            'build_id'    => $entry->build_id,
            'crash_count' => $entry->crash_count,
            'adu_count'   => $entry->adu_count
        );
?>
        <tr>
          <td>
            <?php out::H($entry->build_id) ?>
          </td>
          <td>
            <?php out::H($entry->crash_count) ?>
          </td>
          <td>
            <?php out::H($entry->adu_count) ?>
          </td>
        </tr>
<?php
    }
?>
      <tbody>
    </table>
  </div>
</div>
