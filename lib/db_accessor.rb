# -*- coding: utf-8 -*-
# vi: ts=2 sw=2 sts=0 ai ambw=double fo=tcq
#
#  db_accessor.rb
#
#  入力: bid, uid, mask, level, range
#        mask : どのデータを取得するかを示す２進数の10進表現
#        level: bidから始まって収集するデータの深さ
#        range: full, onlyの二値のうちどちらか。fullは 1..levelの全階層のデータを収集。onlyはlevelのみ。
$:.unshift File.dirname(__FILE__)
require 'date'
require '24kifu_tools.rb'
require '2chkifutools.rb'
require 'post_book_query.rb'

class DbAccessor
  def initialize(param, logger)
    @logger = logger
    @logger.debug { 'DbAccessor new : param : ' + param.to_s }
    @logger.debug { "DbAccessor new : param bid : #{param['bid'] or 'nothing'}" }
    @params	= param
    @bid	= @params['oldbid'] || @params['bid'] || 1
    @name	= @params['name']
    @uid	= @params['uid']
    @mask	= @params['mask'].to_i
    @level	= @params['level']
    @range	= @params['range']
    @turn	= @params['turn']
    @board	= @params['board']
    @black	= @params['black']
    @white	= @params['white']
    @from	= @params['from']
    @to		= @params['to']
    @piece	= @params['piece']
    @promote	= @params['promote']
    @oldbid	= @params['oldbid']
    @kid	= @params['kid']
    @moves	= @params['moves']
    @player1	= @params['player1']
    @player2	= @params['player2']
    @win	= @params['win']
    @date	= @params['date']
    
    @data_name = %w|board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments|
    #@data_name = %w|board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments|
    @masked_data_name = []
    @data_name.each_with_index{|e,i| @masked_data_name.push e if @mask[i] == 1 }
    
    @post_book_query = ''
    @bids = []
    @res = ''
    @gotten = {}
    @logger.debug { 'DbAccessor new : leaving : ' }
  end
  
  attr_accessor :gotten, :logger, :masked_data_name
  
  def send_query(query)
    DB[query].all
  end

  def queries
    bids_expr = @bids.join(',').gsub('bid','')
    { "bids" => 
        case @range
          when 'full'
    	"select bid, nxts, pres from cc_getBids(#{@bid}, #{@level});"
          when 'only'
    	"select bid, nxts, pres from cc_getBids(#{@bid}, #{@level}) where ll = #{@level};"
        end,
    "board"		=> "select * from boards where bid in ( #{bids_expr} );",
    "nextMoves"	=> "select * from moves where bid in ( #{bids_expr} ) order by mid;",
    "prevMoves"	=> "select * from moves where nxt_bid in ( #{bids_expr} );",
    "movePointsByUser"=> "select bid, mid, point as personal from move_point_user
    			 where bid in ( #{bids_expr} ) and userid = #{@uid} order by bid,mid;",
    "movePointsAverage"=> "select bid, mid, point as total from move_points
    			 where bid in ( #{bids_expr} ) order by bid,mid;",
    "moveComments"	=> "select bid,mid,mcomment,userid,uname from move_comments natural inner join users where bid in ( #{bids_expr} ) order by mid;",
    "boardPointByUser"=> "select bid, coalesce(sum(pbpoint), 0) as pbpoint from boardp_users where bid in ( #{bids_expr} ) and userid = #{@uid} group by bid;",
    "boardPointAverage"=> "select bid, coalesce(sum(bpoint), 0) as bpoint from board_points where bid in ( #{bids_expr} ) group by bid;",
    "boardComments"	=> "select bid, bcomment,userid,uname from board_comments natural inner join users where bid in ( #{bids_expr} ) order by userid;",
    "book"		=> "select * from get_book_with_meta(#{@kid});",
    }
  end
  
  def determine_bid_range
    @logger.debug { "into determine_bid_range" } 
    case @range
      when 'full'
        query = "select bid, nxts, pres from cc_getBids(#{@bid}, #{@level});"
      when 'only'
        query = "select bid, nxts, pres from cc_getBids(#{@bid}, #{@level}) where ll = #{@level};"
    end
  
    @logger.debug { "query : #{query}" } 
    begin
      kekka = DB[query]
      @logger.debug { 'kekka : ' + kekka.inspect } 
      @bids = kekka.map(:bid)
      @logger.debug { 'bid_range : ' + @bids.join(',') } 
    rescue => error
      @logger.error { "determine_bid_range : error !" + error.message } 
      print 'error'
    ensure
      #kekka.clear if kekka
    end
  end
=begin
  [{"pres":"{}", "bid":"1", "nxts":"{4,798,1024,1388,26624,49916,66984,92020,94600,94602,94604,94606,94608}"}, {"pres":"{1}", "bid":"4", "nxts":"{3,113,21195,
  
  {:nxts=>"{3,235}", :pres=>"{1}", :bid=>2}   
=end
  def get_data
    kekka = nil
    begin
      @masked_data_name.each{|name|
      @logger.debug { "name : #{name}" } 
      @logger.debug { "query : #{queries[name]}" } 
      kekka = DB[queries[name]]
      @logger.debug { "kekka.inspect : #{kekka.inspect}" } 
      @gotten[name] = []
      kekka.each do |row|
        @logger.debug { row.inspect.to_s }
        modified_row = row.inspect.gsub(/:(\w+)/){ '"' + $1 + '"' }.gsub('=>',':').gsub('"{','[').gsub('}"',']')
        #modified_row = row.inspect.gsub('"{','[').gsub('}"',']').gsub(/:(\w+)/){ '"' + $1 + '"' }.gsub('=>',':').gsub('"{','{')
        @gotten[name].push modified_row
        #rowJsonObj = row.inspect.to_json
        #@gotten[name].push rowJsonObj
    
    end
    #  これではまずい。nameとカラム名が一致してるほうがすくない
      @logger.debug { "gotten[#{name}] : #{@gotten[name].join(',')}" } 
    }
    rescue => error
      @res = { 'error' => -1 }
    ensure
      #kekka.clear if kekka
    end
    return @gotten
  end

  # @gottenの出力を読みやすく整形する
  def log_format(obj)
    ret = "board :\n"
    # obj は hash
      # obj['board'] は array. その要素はhash
    ret += obj['board'].map{|bh| bh.to_a_with_order([:bid,:turn,:board,:black,:white]).join(',') }.join("\n")

    ret += "\nnextMoves :\n"
    nmgrp = obj['nextMoves'].group_by{|m| m[:bid] }.sort
    nmgrp.each{|bid, moves|
      ret += moves.map{|bh| bh.to_a_with_order([:bid,:mid,:m_from,:m_to,:piece,:promote,:nxt_bid]).join(',') }.join("::")
      ret += "\n"
    }

    ret += "\nprevMoves :\n"
    nmgrp = obj['prevMoves'].group_by{|m| m[:bid] }.sort
    nmgrp.each{|bid, moves|
      ret += moves.map{|bh| bh.to_a_with_order([:bid,:mid,:m_from,:m_to,:piece,:promote,:nxt_bid]).join(',') }.join("::")
      ret += "\n"
    }
      ret
  end
  
  def get_msg
    @logger.debug { "into get_msg : masked_data_name : #{@masked_data_name.join(',')}" } 
    @gotten = @masked_data_name.inject({}){|res_hash, name|
      result = DB[queries[name]].all
      @logger.debug { "#{name} : #{result.inspect}" } 
      res_hash[name] = result
      res_hash
    }
#    @logger.debug { "gotten : #{log_format(@gotten)}" } 
    return @gotten.to_msgpack
  end
  
  def get_bids
    result = DB[queries['bids']].all
    @logger.debug { "result.inspect : #{result.inspect}" } 
    @logger.debug { "result : #{result}" } 
    @logger.debug { "result.msgpack : #{result.to_msgpack}" } 
    return result.to_msgpack
  end
  
  def get_book
    @logger.debug { "get_book : query : #{queries['book']}" } 
    result = DB[queries['book']].all
    result[0][:gdate] = result[0][:gdate].to_s
    @logger.debug { "get_book : result.inspect : #{result.inspect}" } 
    return result.to_msgpack
  end

  #
  # post_book
  # 入力(params) paramsのtextキーで渡される。24kifファイルの全文
  # 出力 kifsのレコードのハッシュ(をmsgpackで固めた文字列)
  #
  def post_book
    @logger.debug { "into post_book" } 
    @logger.debug { "given kif text : " + @params['text'] }

    # 受け取った棋譜ファイルを、メタデータと、指し手をバイト列にならべたものにする
    meta_data = kif_info(@params['text'])
    @logger.debug { "meta_data from kif : " + meta_data.inspect }
    byte_data = txt2movebytes(@params['text'])
    @logger.debug { "byte_data from kif : " + byte_data.inspect }

    # DBに棋譜を登録する前準備
    r1 = 'delete from kifread;'
    r1 += 'delete from new_boards;'
    r1 += 'delete from new_moves;'
    result = DB.run(r1)
    @logger.debug { "result of r1 : #{result.inspect}" } 

    # バイトデータをkifreadに登録するためのハッシュに変換
    ha = bytes_to_array_of_hash(byte_data, byte_data.length/2)
    @logger.debug { "hash from byte_data : #{ha.inspect}" } 
    # それをkifreadに登録
    result = DB[:kifread].insert_multiple(ha)

    # kif_insertにより、kifreadからmoves,boards,kifsにデータを移す
    result = DB[:kif_insert.sql_function(nil, meta_data['g'], meta_data['b'], meta_data['w'], meta_data['r'])].all
    @logger.debug { "result of kif_insert : #{result.inspect}" } 

    # responseを作成するために、登録した棋譜を改めて取得
    result = DB[:get_book_with_meta.sql_function(result[0][:kid])].all
    result[0][:gdate] = result[0][:gdate].to_s
    @logger.debug { "result of post_book : #{result.inspect}" } 

    # msgpackして返す
    return result.to_msgpack
  end

  def output
    @logger.debug { "gotten : #{@gotten.inspect}" } 
    @gotten.inspect.gsub('=>',':')
  end

  def to_html
  end

  def regist_board
    @logger.debug { 'into regist_board in DbAccessor' }
    query = "select regist_board('#{@turn}'::bool,'#{@board}'::char(81),\
      '#{@black}'::varchar(38),'#{@white}'::varchar(38),\
       #{@oldbid}::integer, #{@from}::smallint, #{@to}::smallint,\
      '#{@piece}'::char, '#{@promote}'::bool);"
    @logger.debug { "regist_board : query -> #{query}" }
    result = DB[query].all
    @logger.debug { "query done." }
    @logger.debug { "inspect of output of sequel (result.inspect) : #{result.inspect}" } 
    # 内容例：　 [{:regist_board=>"(10411,1,,,,,)"}]
    #    これは新しいボードの登録だったときで、 10411はnew_bid, 1はnew_mid
    # 内容例：　 [{:regist_board=>"(10411,,,,,,)"}]
    #    これは既存のの登録だったときで、 10411はnew_bid
    new_bid, new_mid = result[0][:regist_board].scan(/\d+/).map(&:to_i)
    @logger.debug { "new_bid : #{new_bid},  new_mid : #{new_mid}" } 
    if new_mid
      ret = {}
      # 新しい局面を登録した場合
      @logger.debug { "this board not found, so new board was registered.: #{new_bid}" } 
      ret['board'] = [{"turn"=> @turn, "board"=> @board, "black"=> @black, "bid"=> new_bid.to_s, "white"=> @white}]
      ret['nextMoves'] = []
      ret['prevMoves'] = [{"promote"=> @promote, "m_from"=> @from, "m_to"=> @to, "bid"=> @bid, "nxt_bid"=> new_bid.to_s, "mid"=> new_mid.to_s, "piece"=> @piece}]
         # わざとすべて文字列の値としている
      @logger.debug { "returning hash : #{ret.inspect}" } 
      packed_ret = ret.to_msgpack
      @logger.debug { "ret.msgpack : #{packed_ret}" } 
      return packed_ret
    else
      # 既存の局面だった場合(midはregist_boardの答えには含まれない）
      @bid = new_bid
      @logger.debug { "@bid is set to : #{@bid}" } 
      @logger.debug { "this board exists, so try to get full range." } 
      @logger.debug { "@params now : #{@params.inspect}" } 
      determine_bid_range
      return get_msg
    end
  end
end
