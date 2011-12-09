<?php defined('SYSPATH') or die('No direct script access.');

class Build_Controller extends Controller {

    public function __construct() {
        parent::__construct();
        $this->build_model = new Build_Model();
    }

    private function _versionExists($version) {
        if (!$this->versionExists($version)) {
            Kohana::show_404();
        }
    }

    public function index() {
        $products = $this->featured_versions;
        $product = null;

        if(empty($products)) {
            Kohana::show_404();
        }

        foreach($products as $individual) {
            if($individual->release == 'major') {
                $product = $individual;
            }
        }

        if(empty($product)) {
            $product = array_shift($products);
        }

        return url::redirect('/build/byversion/' . $product->product);
    }

    public function byversion($product=null, $version=null)
    {
        if(is_null($product)) {
          Kohana::show_404();
        }
        $this->navigationChooseVersion($product, $version);
        if (empty($version)) {
            $this->_handleEmptyVersion($product, 'byversion');
        } else {
            $this->_versionExists($version);
        }

        $duration = (int)Input::instance()->get('duration');
        if (empty($duration)) {
            $duration = Kohana::config('products.duration');
        }

        $p = urlencode($product);
        $v = urlencode($version);
        $resp = $this->build_model->getCrashesByBuildIDForDateRange($p, $v, $duration);

        if ($resp) {
            $this->setViewData(array(
                'resp'           => $resp,
                'duration'       => $duration,
                'product'        => $product,
                'version'        => $version,
                'nav_selection'  => 'new_report',
                'end_date'       => $resp->endDate,
                'url_base'       => url::site('build/byversion/'.$product.'/'.$version),
                'url_nav'        => url::site('products/'.$product),
                'totalItemText' => "Results",
                'navPathPrefix' => url::site('build/byversion/'.$product.'/'.$version) . '?duration=' . $duration ,
            ));
        } else {
            header("Data access error", TRUE, 500);
            $this->setViewData(
                array(
                   'nav_selection' => 'top_crashes',
                   'product'       => $product,
                   'url_nav'       => url::site('products/'.$product),
                   'version'       => $version,
                   'resp'          => $resp
                )
            );
        }
    }

     private function _handleEmptyVersion($product, $method) {
        $product_version = $this->branch_model->getRecentProductVersion($product);
        if (empty($product_version)) {
            // If no current major versions are found, grab any available version
            $product_versions = $this->branch_model->getCurrentProductVersionsByProduct($product);
            if (isset($product_versions[0])) {
                $product_version = array_shift($product_versions);
            }
        }

        $version = $product_version->version;
        $this->chooseVersion(
            array(
            'product' => $product,
            'version' => $version,
            'release' => null
            )
        );

        url::redirect('newreport/'.$method.'/'.$product.'/'.$version);
    }
}
?>
