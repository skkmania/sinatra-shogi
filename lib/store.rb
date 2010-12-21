# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  store.rb
#
require 'lib/util.rb'
require 'lib/db_accessor.rb'

class Store < Hash
  def initialize(logger=Logger.new('log/store.log'))
    @logger = logger
    @current_bid = 1
    @dba = DbAccessor.new
    @keys = %w[board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments]
  end
  attr_accessor :current_bid, :dba

  def fromState(state)
    self[@current_bid] = state.get(@current_bid, 'dummy')
  end

  def update_store(params=nil)
    params = params ||
	{'bid'	=> @current_bid,
	'mask'	=> 7,
	'level'	=> 3,
	'range' => 'full'}
    @dba.read_params(params)
    @dba.set_masked_data_name
    @dba.determine_bid_range
    @dba.get_msg
    @logger.debug(@dba.log_format @dba.gotten)
    read_from_db @dba.gotten
  end

  def read_from_db(data)
    self.merge! data
  end
  #
  #  complement(board, move)
  #    機能：情報の足りないBoard,Moveオブジェクトを受け取り補完して返す
  #          副作用としてStoreをupdateする
  #    入力: board Boardオブジェクト bidが足りない
  #        : move  Moveオブジェクト  mid, nxt_bidが足りない
  #    出力: 上記オブジェクト
  def complement(board, move)
    @logger.debug("into complement with #{board.inspect}, #{move.inspect}")
    if move = find_move(move)
      board.bid = move[:nxt_bid]
    else
      @dba.read_params(board) # regist_boardのためのパラメータ渡し
        # ただし、これで本当によいか確認が必要 2010.12.21
      result = @dba.regist_board
      board.bid  = result['board'][0][:bid]
      move       = result['prevMoves'][0]
      self.merge! result # ここは怪しい！！
        # regist_boardの返り値とStoreの構造って同じだっけ？？
    end
    @logger.debug("leaving complement with #{board.inspect}, #{move.inspect}")
    return [board, move]
  end
  #
  #  get_section(bid)
  #    機能: 指定されたbidのsectionを返す
  #    入力: bid 数値
  #    出力: sectionを表すHash
  def get_section(bid)
    ret = {}
    ret['bid']   = bid
    ret['board'] = self['board'].select{|h| h[:bid] == bid }
    ret['next']  = self['nextMoves'].select{|h| h[:bid] == bid }
    ret['prev']  = self['prevMoves'].select{|h| h[:bid] == bid }
        # これでよい？nxt_bid?
    return ret
  end
  
  #
  #  find_move
  #    Storeの中から指し手を探す
  #    入力: move : 探したい指し手のMove オブジェクト
  #    出力: Move オブジェクト 見つかったとき、その指し手
  #          nil  指し手が見つからなかったとき、nilを返す
  def find_move(move)
    @logger.debug("into find_move with #{move.inspect}")
    res = self['nextMoves'].select{|h| h[:bid] == move[:bid] }.find{|e|
            (e[:m_from]  == move[:m_from]) &&
            (e[:m_to]    == move[:m_to]) &&
            (e[:piece]   == move[:piece]) &&
            (e[:promote] == move[:promote])
      }
    if res
      @logger.debug("leaving complement with #{res.inspect}")
      return res
    else
      @logger.debug("leaving complement with nil")
      return nil
    end
  end
end
