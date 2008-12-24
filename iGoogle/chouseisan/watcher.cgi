#!/usr/bin/perl -wT

use strict;
use CGI;

use Template;

use Data::Dumper;

my $q = CGI->new;
my $stash = {};
my $id = $q->param('keywords');

$stash->{url} = ( $id ) ? 'http://www.tatamilab.jp/~toshi_i/schedule/List?h=' . $id : "";

print qq(Content-Type: text/xml; charset="utf-8"\n\n);
my $tt = Template->new({ INCLUDE_PATH => '.' });
$tt->process('watcher.tt',$stash) || die $tt->error();

exit;

