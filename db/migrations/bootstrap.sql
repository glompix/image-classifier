CREATE TABLE if not exists `version` (
  `version` int(11) NOT NULL DEFAULT '0',
  `migrating` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
