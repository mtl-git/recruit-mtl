#!/usr/bin/perl -wT

use lib '/home/bqbq/local/lib/perl5';

use strict;
use CGI;

use Template;

use Data::Dumper;

my $q = CGI->new;
my $stash = {};
my $id = $q->param('keywords');

$stash->{url} = ( $id ) ? 'http://www.tatamilab.jp/~toshi_i/schedule/List?h=' . $id : "";

print qq(Content-Type: text/plain; charset="utf-8"\n\n);
my $tt = Template->new({ INCLUDE_PATH => '.' });
$tt->process('watcher.tt',$stash) || die $tt->error();

exit;

